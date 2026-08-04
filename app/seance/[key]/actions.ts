"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type Programme, trouverSeance } from "@/lib/programme";

export type EtatSeance = string | null;

/** Champ vide -> null : « pas saisi » et « zéro » ne sont pas la même chose. */
function nombreOuNull(valeur: FormDataEntryValue | null) {
  const texte = String(valeur ?? "").trim().replace(",", ".");
  if (!texte) return null;
  const n = Number(texte);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export async function validerSeance(
  _etat: EtatSeance,
  formData: FormData,
): Promise<EtatSeance> {
  const cle = String(formData.get("seance_key") ?? "");

  const supabase = await createClient();
  const { data: session } = await supabase.auth.getClaims();
  const userId = session?.claims.sub;
  if (!userId) redirect("/connexion");

  const { data: ligne } = await supabase
    .from("programs")
    .select("id, program_json")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle<{ id: string; program_json: Programme }>();

  if (!ligne) return "Ton programme est introuvable.";

  // La séance est relue depuis la base : les noms d'exercices ne viennent
  // jamais du formulaire, seules les valeurs saisies en viennent.
  const seance = trouverSeance(ligne.program_json, cle);
  if (!seance) return "Cette séance ne fait pas partie de ton programme.";

  const contenu =
    seance.type === "muscu"
      ? {
          type: "muscu" as const,
          exercises: seance.exercises.map((exercice, i) => ({
            name: exercice.name,
            series: Array.from({ length: exercice.sets }, (_, j) => ({
              reps: nombreOuNull(formData.get(`reps-${i}-${j}`)),
              charge_kg: nombreOuNull(formData.get(`charge-${i}-${j}`)),
            })),
          })),
        }
      : {
          type: "cardio" as const,
          blocks: seance.blocks.map((bloc) => ({ format: bloc.format })),
        };

  const { error } = await supabase.from("workout_logs").insert({
    user_id: userId,
    program_id: ligne.id,
    session_key: cle,
    exercises_json: contenu,
  });

  if (error) {
    return "La séance n'a pas pu être enregistrée. Réessaie.";
  }

  redirect("/dashboard");
}
