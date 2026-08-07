/**
 * Vérifie que le webhook Stripe ne peut pas produire une valeur que la base
 * refuse. Un `status` hors contrainte ferait échouer l'écriture en silence
 * côté Stripe — donc un accès qui ne s'ouvre pas après un paiement, ou qui ne
 * se ferme pas après une résiliation. Les deux se voient trop tard.
 *
 * Lancer :
 *   node --experimental-strip-types --conditions=react-server \
 *        scripts/test-stripe.ts
 *
 * Ne touche ni à la base, ni à Stripe, ni au réseau.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PLANS, estPlan, statutPourBase } from "../lib/stripe.ts";

const schema = readFileSync(
  new URL("../docs/schema.sql", import.meta.url),
  "utf8",
);

// La seule définition de `subscriptions`. `programs` a lui aussi une colonne
// `status`, avec d'autres valeurs : chercher dans tout le fichier tomberait
// sur la mauvaise contrainte.
const tableAbonnements = schema.match(
  /create table public\.subscriptions \(([\s\S]*?)\n\);/,
);
assert.ok(tableAbonnements, "table subscriptions introuvable dans schema.sql");

/** Extrait les valeurs d'un `check (colonne in ('a','b'))` de la table. */
function valeursAutorisees(colonne: string) {
  const trouve = tableAbonnements![1].match(
    new RegExp(`check\\s*\\(${colonne} in \\(([^)]+)\\)\\)`),
  );
  assert.ok(trouve, `contrainte introuvable pour ${colonne} dans schema.sql`);
  return trouve[1].split(",").map((v) => v.trim().replace(/'/g, ""));
}

// Tous les statuts que l'API Stripe peut renvoyer sur un abonnement.
const STATUTS_STRIPE = [
  "active",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "past_due",
  "paused",
  "trialing",
  "unpaid",
] as const;

const statutsBase = valeursAutorisees("status");
for (const statut of STATUTS_STRIPE) {
  const traduit = statutPourBase(statut);
  assert.ok(
    statutsBase.includes(traduit),
    `statut Stripe « ${statut} » traduit en « ${traduit} », que la base refuse`,
  );
}

// Un statut inconnu — Stripe en ajoute au fil du temps — doit fermer l'accès,
// jamais l'ouvrir par défaut.
assert.equal(
  statutPourBase("statut_qui_nexiste_pas_encore" as never),
  "canceled",
);

// Les plans du code et ceux de la base doivent désigner les mêmes choses.
const plansBase = valeursAutorisees("plan");
assert.deepEqual(Object.keys(PLANS).sort(), [...plansBase].sort());

// `estPlan` garde l'action de paiement : elle décide si une valeur venue d'un
// formulaire peut servir à choisir un prix.
assert.ok(estPlan("fondateur"));
assert.ok(!estPlan("gratuit"));
assert.ok(!estPlan(undefined));
// Piège : `"toString" in PLANS` est vrai via le prototype.
assert.ok(!estPlan("toString"));

console.log("OK — statuts et plans alignés avec docs/schema.sql");
