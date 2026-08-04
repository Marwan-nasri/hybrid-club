"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type EtatSuppression = string | null;

/** Le membre doit écrire ce mot exactement : pas de suppression au clic. */
export const CONFIRMATION = "SUPPRIMER";

export async function supprimerCompte(
  _etat: EtatSuppression,
  formData: FormData,
): Promise<EtatSuppression> {
  const supabase = await createClient();
  const { data: session } = await supabase.auth.getClaims();
  const userId = session?.claims.sub;
  if (!userId) redirect("/connexion");

  if (String(formData.get("confirmation") ?? "").trim() !== CONFIRMATION) {
    return `Écris ${CONFIRMATION} en majuscules pour confirmer.`;
  }

  // Supprimer l'utilisateur suffit : profiles référence auth.users en
  // `on delete cascade`, et programs, workout_logs et subscriptions
  // référencent profiles de la même façon. Tout part en une fois.
  const { error } = await createAdminClient().auth.admin.deleteUser(userId);

  if (error) {
    console.error("[compte] échec de la suppression", error);
    return "La suppression a échoué. Réessaie ou écris-nous.";
  }

  await supabase.auth.signOut();
  redirect("/connexion?compte=supprime");
}
