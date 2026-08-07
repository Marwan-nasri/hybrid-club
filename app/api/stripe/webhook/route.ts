import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { estPlan, statutPourBase, stripe } from "@/lib/stripe";

/**
 * Seul endroit du code autorisé à écrire dans `subscriptions`. Le retour du
 * navigateur après un paiement ne prouve rien : il est falsifiable, et il
 * n'arrive pas si le membre ferme l'onglet.
 */
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ erreur: "Signature absente." }, { status: 400 });
  }

  // Le corps brut, pas le JSON parsé : la signature porte sur les octets reçus.
  const corps = await request.text();

  let evenement: Stripe.Event;
  try {
    evenement = stripe().webhooks.constructEvent(
      corps,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (erreur) {
    // Signature invalide = requête qui ne vient pas de Stripe. On s'arrête là.
    console.error("[stripe] signature refusée", erreur);
    return NextResponse.json({ erreur: "Signature invalide." }, { status: 400 });
  }

  switch (evenement.type) {
    case "checkout.session.completed": {
      const session = evenement.data.object;
      // Une session peut aussi être un paiement unique : sans abonnement,
      // il n'y a rien à enregistrer.
      if (!session.subscription) break;
      const abonnement = await stripe().subscriptions.retrieve(
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription.id,
      );
      await enregistrer(abonnement, session.client_reference_id);
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      // `deleted` compris : l'objet porte alors `status: "canceled"`, ce qui
      // referme l'accès par le même chemin que les autres mises à jour.
      await enregistrer(evenement.data.object, null);
      break;
  }

  // Tout le reste est ignoré volontairement, mais acquitté : un 4xx ferait
  // rejouer l'événement par Stripe pendant trois jours pour rien.
  return NextResponse.json({ recu: true });
}

async function enregistrer(
  abonnement: Stripe.Subscription,
  referenceSession: string | null,
) {
  // `client_reference_id` n'existe qu'au premier paiement. Ensuite, le lien
  // vers le membre vit dans les metadata de l'abonnement, posées au checkout.
  const userId = referenceSession ?? abonnement.metadata.user_id;
  if (!userId) {
    console.error("[stripe] abonnement sans membre", abonnement.id);
    return;
  }

  const plan = abonnement.metadata.plan;

  // Depuis 2025 la période vit sur les lignes de l'abonnement, plus sur
  // l'abonnement lui-même.
  const finDePeriode = abonnement.items.data[0]?.current_period_end;

  const { error } = await createAdminClient()
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        stripe_customer_id:
          typeof abonnement.customer === "string"
            ? abonnement.customer
            : abonnement.customer.id,
        stripe_subscription_id: abonnement.id,
        ...(estPlan(plan) ? { plan } : {}),
        status: statutPourBase(abonnement.status),
        current_period_end: finDePeriode
          ? new Date(finDePeriode * 1000).toISOString()
          : null,
      },
      { onConflict: "user_id" },
    );

  if (error) {
    // Renvoyer une erreur ferait rejouer l'événement par Stripe, ce qui est
    // exactement ce qu'on veut : sans cette ligne, l'accès reste fermé.
    console.error("[stripe] écriture refusée", error);
    throw error;
  }
}
