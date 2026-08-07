import type { Plan } from "@/lib/stripe";

/**
 * Essai gratuit avant le premier prélèvement. La carte est demandée dès le
 * départ : au terme, Stripe prélève sans rien redemander au membre.
 * Pendant l'essai l'abonnement est en `trialing`, que `lib/abonnement.ts`
 * traite comme un accès ouvert.
 */
export const JOURS_ESSAI = 7;

/**
 * Les trois formules, affichées à l'identique sur la landing et sur l'écran
 * d'abonnement. Un seul endroit : deux listes finiraient par annoncer deux
 * prix différents. Les montants réels restent ceux de Stripe — ce fichier
 * n'est que l'affichage.
 * Pas d'import depuis `lib/stripe.ts` autre que le type : la landing est
 * publique et n'a pas à charger le SDK.
 */
export const TARIFS: {
  plan: Plan;
  nom: string;
  prix: string;
  periode: string;
  argument: string;
  fondateur: boolean;
}[] = [
  {
    plan: "fondateur",
    nom: "Fondateur",
    prix: "49 €",
    periode: "par an",
    argument: "Le tarif de lancement, conservé tant que tu restes membre.",
    fondateur: true,
  },
  {
    plan: "mensuel",
    nom: "Mensuel",
    prix: "9,99 €",
    periode: "par mois",
    argument: "Sans engagement, tu arrêtes quand tu veux.",
    fondateur: false,
  },
  {
    plan: "annuel",
    nom: "Annuel",
    prix: "79 €",
    periode: "par an",
    argument: "Deux mois offerts par rapport au mensuel.",
    fondateur: false,
  },
];
