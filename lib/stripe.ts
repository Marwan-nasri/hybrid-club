import "server-only";
import Stripe from "stripe";

let client: Stripe | undefined;

/**
 * Client Stripe côté serveur uniquement. La clé secrète ne doit jamais
 * atteindre le navigateur — `server-only` fait échouer le build si un
 * composant client importe ce fichier.
 *
 * Construit au premier appel et non à l'import : le build Next évalue les
 * modules des routes, et un `new Stripe()` en haut de fichier fait échouer
 * `next build` partout où les secrets ne sont pas présents.
 *
 * Pas d'`apiVersion` : le SDK est déjà épinglé sur la sienne, la repasser à la
 * main crée une deuxième version à maintenir.
 */
export function stripe() {
  return (client ??= new Stripe(process.env.STRIPE_SECRET_KEY!));
}

export type Plan = "fondateur" | "mensuel" | "annuel";

/** Les plans du club, dans l'ordre d'affichage. Prix = source Stripe. */
export const PLANS: Record<Plan, { libelle: string; priceId: string }> = {
  fondateur: {
    libelle: "Fondateur",
    priceId: process.env.STRIPE_PRICE_FONDATEUR!,
  },
  mensuel: { libelle: "Mensuel", priceId: process.env.STRIPE_PRICE_MENSUEL! },
  annuel: { libelle: "Annuel", priceId: process.env.STRIPE_PRICE_ANNUEL! },
};

export function estPlan(valeur: unknown): valeur is Plan {
  // `hasOwn` et non `in` : `"toString" in PLANS` est vrai, hérité du prototype.
  return typeof valeur === "string" && Object.hasOwn(PLANS, valeur);
}

/**
 * Stripe connaît plus de statuts que notre contrainte SQL n'en accepte
 * (`subscriptions.status`). Sans cette traduction, un `unpaid` ferait échouer
 * l'écriture du webhook — donc laisserait un accès ouvert qui devrait être
 * fermé. Tout ce qui n'ouvre pas l'accès retombe sur `canceled`.
 */
export function statutPourBase(statut: Stripe.Subscription.Status) {
  switch (statut) {
    case "active":
    case "trialing":
    case "past_due":
    case "incomplete":
      return statut;
    default:
      return "canceled";
  }
}
