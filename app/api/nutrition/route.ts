import { NextResponse } from "next/server";
import { abonnementActif } from "@/lib/abonnement";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { genererIdeesRepas } from "@/lib/anthropic";
import { calculerBesoins } from "@/lib/nutrition";
import type { ProfilComplet } from "@/lib/prompts/profil";

export const maxDuration = 60;

const CHAMPS_PROFIL =
  "sex, birth_year, height_cm, weight_kg, goal, level, equipment, days_per_week, diet, disliked_foods";

/**
 * « D'autres idées » : régénère uniquement les repas. Les calories et les
 * macros sont recalculées en TypeScript à partir du profil — elles ne
 * dépendent jamais de l'IA et ne changent donc pas d'un clic à l'autre.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: session } = await supabase.auth.getClaims();
  const userId = session?.claims.sub;
  if (!userId) {
    return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  }

  // Chaque clic sur « d'autres idées » est un appel facturé à l'API Anthropic :
  // il est réservé aux membres, et pas seulement caché derrière une page.
  if (!(await abonnementActif(userId))) {
    return NextResponse.json({ erreur: "Abonnement requis." }, { status: 402 });
  }

  const [{ data: profil }, { data: programme }] = await Promise.all([
    supabase
      .from("profiles")
      .select(CHAMPS_PROFIL)
      .eq("id", userId)
      .maybeSingle<ProfilComplet>(),
    supabase
      .from("programs")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle<{ id: string }>(),
  ]);

  if (!profil || !programme) {
    return NextResponse.json(
      { erreur: "Ton programme est introuvable." },
      { status: 404 },
    );
  }

  let nutrition;
  try {
    nutrition = await genererIdeesRepas(profil, calculerBesoins(profil));
  } catch (erreur) {
    console.error("[nutrition] échec de la régénération", erreur);
    return NextResponse.json(
      { erreur: "Impossible de trouver d'autres idées. Réessaie." },
      { status: 502 },
    );
  }

  // Service role : `programs` n'a pas de policy UPDATE, pour la même raison
  // qu'elle n'a pas de policy INSERT. On ne touche qu'aux idées de repas —
  // un vrai changement de cadre (poids, objectif) archivera une version,
  // conformément à docs/nutrition-spec.md §6.
  const { error } = await createAdminClient()
    .from("programs")
    .update({ nutrition_json: nutrition })
    .eq("id", programme.id);

  if (error) {
    console.error("[nutrition] échec de la mise à jour", error);
    return NextResponse.json(
      { erreur: "Les nouvelles idées n'ont pas pu être enregistrées." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
