"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PLANS, estPlan, stripe } from "@/lib/stripe";
import { JOURS_ESSAI } from "@/lib/tarifs";

async function origine() {
  return (await headers()).get("origin");
}

/** Membre + son éventuel client Stripe déjà créé. */
async function membre() {
  const supabase = await createClient();
  const { data: session } = await supabase.auth.getClaims();
  const userId = session?.claims.sub;
  if (!userId) redirect("/connexion");

  const { data: abonnement } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle<{ stripe_customer_id: string | null }>();

  return {
    userId,
    email: session!.claims.email as string | undefined,
    clientStripe: abonnement?.stripe_customer_id ?? null,
  };
}

export async function souscrire(formData: FormData) {
  const plan = formData.get("plan");
  if (!estPlan(plan)) redirect("/abonnement");

  const { userId, email, clientStripe } = await membre();
  const base = await origine();

  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: PLANS[plan].priceId, quantity: 1 }],
    // Réutiliser le client existant, sinon un membre qui reprend un abonnement
    // se retrouve en double dans Stripe et le portail ne montre qu'une moitié.
    // En mode `subscription`, Stripe crée toujours le client s'il n'y en a pas
    // — `customer_creation` n'existe qu'en mode `payment`.
    ...(clientStripe ? { customer: clientStripe } : { customer_email: email }),
    client_reference_id: userId,
    // Les metadata suivent l'abonnement : les événements de renouvellement et
    // d'annulation, eux, n'ont pas de `client_reference_id`.
    subscription_data: {
      metadata: { user_id: userId, plan },
      trial_period_days: JOURS_ESSAI,
    },
    locale: "fr",
    success_url: `${base}/dashboard?bienvenue=1`,
    cancel_url: `${base}/abonnement`,
  });

  if (!session.url) throw new Error("Stripe n'a pas renvoyé d'URL de paiement.");
  redirect(session.url);
}

/** Gérer le moyen de paiement, changer de formule, résilier. */
export async function ouvrirPortail() {
  const { clientStripe } = await membre();
  if (!clientStripe) redirect("/abonnement");

  const session = await stripe().billingPortal.sessions.create({
    customer: clientStripe,
    return_url: `${await origine()}/compte`,
    locale: "fr",
  });

  redirect(session.url);
}
