import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { genererPourProfil } from "@/lib/anthropic";
import type { ProfilComplet } from "@/lib/prompts/profil";

// La génération prend 15-30s : au-delà de la limite par défaut de Vercel, la
// fonction serait coupée en plein appel.
export const maxDuration = 60;

const CHAMPS_PROFIL =
  "sex, birth_year, height_cm, weight_kg, goal, level, equipment, days_per_week, diet, disliked_foods, onboarding_completed";

export async function POST() {
  const supabase = await createClient();
  const { data: session } = await supabase.auth.getClaims();
  const userId = session?.claims.sub;
  if (!userId) {
    return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  }

  const { data: profil } = await supabase
    .from("profiles")
    .select(CHAMPS_PROFIL)
    .eq("id", userId)
    .maybeSingle<ProfilComplet & { onboarding_completed: boolean }>();

  if (!profil?.onboarding_completed) {
    return NextResponse.json(
      { erreur: "Complète ton profil avant de lancer la génération." },
      { status: 400 },
    );
  }

  // Un programme actif existe déjà : on ne régénère pas (et on ne paie pas un
  // second appel) si le membre recharge la page d'attente.
  const { data: existant } = await supabase
    .from("programs")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (existant) {
    return NextResponse.json({ ok: true, deja_genere: true });
  }

  let genere;
  try {
    genere = await genererPourProfil(profil);
  } catch (erreur) {
    console.error("[generate] échec de la génération", erreur);
    return NextResponse.json(
      { erreur: "La génération a échoué. Réessaie dans un instant." },
      { status: 502 },
    );
  }

  const valideJusqu = new Date();
  valideJusqu.setDate(valideJusqu.getDate() + genere.program_json.meta.weeks * 7);

  // Service role : le programme est produit par le serveur, jamais par le
  // membre. `programs` n'a donc volontairement pas de policy INSERT.
  const { error } = await createAdminClient().from("programs").insert({
    user_id: userId,
    version: 1,
    status: "active",
    program_json: genere.program_json,
    nutrition_json: genere.nutrition_json,
    valid_until: valideJusqu.toISOString().slice(0, 10),
  });

  if (error) {
    console.error("[generate] échec de l'insertion", error);
    return NextResponse.json(
      { erreur: "Ton programme a été généré mais n'a pas pu être enregistré." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
