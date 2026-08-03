"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EtatOnboarding = string | null;

// Les contraintes de domaine (enums, bornes) sont portées par les CHECK de
// docs/schema.sql — inutile de les redupliquer ici. On ne vérifie que la
// présence, pour ne jamais passer onboarding_completed à true sur des NULL.
const REQUIS = [
  "sex",
  "birth_year",
  "height_cm",
  "weight_kg",
  "goal",
  "level",
  "equipment",
  "days_per_week",
] as const;

export async function enregistrerProfil(
  _etat: EtatOnboarding,
  formData: FormData,
): Promise<EtatOnboarding> {
  const supabase = await createClient();
  const { data: session } = await supabase.auth.getClaims();
  const id = session?.claims.sub;
  if (!id) redirect("/connexion");

  const v = Object.fromEntries(
    REQUIS.map((c) => [c, String(formData.get(c) ?? "").trim()]),
  ) as Record<(typeof REQUIS)[number], string>;

  if (Object.values(v).some((valeur) => !valeur)) {
    return "Il manque des réponses. Remplis tous les champs avant de valider.";
  }

  const { data: maj, error } = await supabase
    .from("profiles")
    .update({
      sex: v.sex,
      birth_year: Number(v.birth_year),
      height_cm: Number(v.height_cm),
      weight_kg: Number(v.weight_kg),
      goal: v.goal,
      level: v.level,
      equipment: v.equipment,
      days_per_week: Number(v.days_per_week),
      diet: String(formData.get("diet") ?? "aucun"),
      disliked_foods:
        String(formData.get("disliked_foods") ?? "").trim() || null,
      onboarding_completed: true,
    })
    .eq("id", id)
    .select("id");

  if (error) {
    return "Certaines réponses ne sont pas valides. Vérifie et réessaie.";
  }

  // 0 ligne = pas d'erreur SQL mais rien de modifié : profil absent (compte
  // créé avant le trigger on_auth_user_created) ou bloqué par le RLS.
  if (!maj?.length) {
    return "Ton profil est introuvable. Déconnecte-toi puis reconnecte-toi.";
  }

  redirect("/generation");
}
