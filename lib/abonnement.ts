import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Les deux seuls statuts qui ouvrent l'accès. Volontairement ici et non dans
 * `lib/stripe.ts` : une page qui vérifie l'accès n'a pas à charger le SDK
 * Stripe, ni à exiger `STRIPE_SECRET_KEY` pour s'afficher.
 */
const STATUTS_ACTIFS = ["active", "trialing"];

/**
 * Vrai si le membre a un abonnement en cours. Pour les routes API, qui doivent
 * répondre un code d'erreur plutôt que rediriger un `fetch`.
 */
export async function abonnementActif(userId: string) {
  const supabase = await createClient();
  // Lecture sous RLS : la policy « own subscription read » garantit qu'on ne
  // voit que sa propre ligne, même si la requête se trompait de user_id.
  const { data } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", userId)
    .maybeSingle<{ status: string }>();

  return !!data && STATUTS_ACTIFS.includes(data.status);
}

/**
 * Garde d'accès des écrans payants. À appeler en tête de chaque page qui
 * délivre le produit — pas dans `app/(app)/layout.tsx` : /compte est dans le
 * même groupe et doit rester joignable sans abonnement, sinon un membre dont
 * l'abonnement s'arrête ne pourrait plus exporter ni supprimer ses données.
 *
 * Retourne l'id du membre, que les pages utilisent ensuite pour leurs requêtes.
 */
export async function exigerAbonnement() {
  const supabase = await createClient();
  const { data: session } = await supabase.auth.getClaims();
  const userId = session?.claims.sub;
  if (!userId) redirect("/connexion");

  if (!(await abonnementActif(userId))) redirect("/abonnement");

  return userId;
}
