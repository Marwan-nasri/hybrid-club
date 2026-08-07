# HYBRID CLUB — Plan d'exécution V1 (étape par étape)

Coche chaque case au fur et à mesure. Ne saute pas d'étape, ne dévie pas du périmètre.

---

## ✅ FAIT
- [x] Projet Supabase créé (région EU — Francfort)
- [x] Schéma SQL exécuté (5 tables + RLS)
- [x] Landing page waitlist en ligne (Vercel)
- [x] Projet Next.js créé + packages Supabase installés
- [x] .env.local configuré avec les clés Supabase
- [x] Dossier docs/ + CLAUDE.md en place

---

## SEMAINE 1 — Fondations + moteur de génération

### Étape 1 — Auth fonctionnelle (½ journée)
- [x] Config auth Supabase via Claude Code (client browser + server + middleware)
      → en Next 16 le middleware s'appelle `proxy.ts` / `export function proxy`
- [x] Page /connexion (inscription + login email)
- [x] **TEST** : créer un compte → une ligne apparaît dans `profiles`
- [x] Push GitHub + deploy Vercel + variables d'env → tester le compte sur l'URL en ligne
      → `vercel.json` force la région `fra1` : les fonctions ne traitent pas de
        données personnelles depuis les États-Unis

### Étape 2 — Onboarding (1 journée)
- [x] Rediriger vers /onboarding si `onboarding_completed = false`
      → pas via le proxy : `/auth/confirm` et le login renvoient vers `/onboarding`,
        qui renvoie lui-même vers `/` si le profil est déjà complété
- [x] Questionnaire mobile-first : sexe → âge → taille → poids → objectif → niveau →
      matériel → jours/semaine → régime → aliments détestés
      → un seul formulaire scrollable, pas 8 écrans séparés (à découper si les
        bêta-testeurs décrochent)
- [x] Écriture dans `profiles` + passage `onboarding_completed = true`
- [x] **TEST** : compléter l'onboarding → profil rempli + numéro de membre attribué

### Étape 3 — Moteur de génération (3-4 jours) ⚠️ LE MORCEAU CRITIQUE
- [x] `lib/nutrition.ts` : calcul calories/macros (Mifflin-St Jeor + facteurs + objectifs + garde-fous)
      → contrôle : `node --experimental-strip-types lib/nutrition.ts`
- [x] `lib/prompts/program-generation.ts` : prompt programme
- [x] `lib/prompts/nutrition-generation.ts` : prompt repas
      → l'IA ne renvoie que les idées ; kcal, macros et disclaimer viennent du TS
- [x] Schémas Zod pour valider le JSON retourné
      → contrôle : `node --experimental-strip-types lib/prompts/verif.ts`
- [x] `/api/generate/route.ts` : profil → prompt → Anthropic → validation Zod → insert `programs`
      (⚠️ appel Anthropic CÔTÉ SERVEUR uniquement — garanti par `server-only`)
      → insert en service role : `programs` n'a volontairement pas de policy INSERT
- [x] Écran d'attente engageant pendant la génération (15-30s) → `/generation`
- [x] **TEST CRITIQUE** : générer 10 programmes sur 10 profils différents
      → 10/10, 16-29s. Matériel et régimes respectés, garde-fous tenus,
        aucune promesse chiffrée. `scripts/test-generation.ts` pour rejouer.

---

## SEMAINE 2 — Le produit utilisable

### Étape 4 — Dashboard + séances (2 jours)
- [x] Dashboard /dashboard : séance du jour selon le planning
      → repos + prochaine séance si rien n'est prévu, + 3 dernières séances
- [x] Écran séance /seance/[key] : liste exercices + saisie séries/reps/charges
      → hors de la nav, champs h-14 et bouton collé en bas (saisie en salle) ;
        les charges de la dernière fois servent de placeholder
- [x] Bouton "séance terminée" → insert `workout_logs`
      → la séance est relue en base, le formulaire ne fournit que les valeurs
- [x] Vue programme complet /programme

### Étape 5 — Nutrition (1 jour)
- [x] Écran /nutrition : macros en gros + idées de repas en cartes
- [x] Bouton "d'autres idées" → régénère seulement les repas
      → vérifié : les repas changent, les macros restent identiques au kcal près
- [x] Disclaimer visible (bas de page, jamais replié)

### Étape 6 — Paiement Stripe (2 jours)
- [ ] Produits Stripe : fondateur 49€/an, mensuel 9,99€, annuel 79€
      → à créer dans le dashboard Stripe, puis renseigner en variables d'env
        (local + Vercel) : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
        `STRIPE_PRICE_FONDATEUR`, `STRIPE_PRICE_MENSUEL`, `STRIPE_PRICE_ANNUEL`
- [x] Checkout → action serveur `souscrire` dans `app/(app)/abonnement/actions.ts`
      → une action serveur plutôt qu'une route API : pas de JS client, et c'est
        le motif déjà utilisé partout ailleurs. Les tarifs affichés viennent de
        `lib/tarifs.ts`, partagé avec la landing pour éviter deux prix
- [x] /api/stripe/webhook → upsert `subscriptions` (SEULE source de vérité)
      → `statutPourBase()` traduit les statuts Stripe vers la contrainte SQL :
        tout ce qui n'ouvre pas l'accès retombe sur `canceled`
- [x] Accès conditionné : `exigerAbonnement()` (`lib/abonnement.ts`) sur
      dashboard, programme, nutrition, séance + l'action de validation de séance
      → pas dans le layout (app) : /compte doit rester joignable sans
        abonnement pour l'export et la suppression RGPD. /api/nutrition renvoie
        402 sans abonnement — chaque clic est un appel Anthropic facturé
- [x] Stripe Customer Portal pour gérer/annuler → depuis /compte
- [x] Essai gratuit de 7 jours (`JOURS_ESSAI` dans `lib/tarifs.ts`)
      → carte enregistrée dès le départ, 0 € dû le jour J, prélèvement au 8e.
        Rien à coder côté accès : l'abonnement est en `trialing`, déjà traité
        comme actif. Un échec de prélèvement au terme passe en `past_due`, que
        `exigerAbonnement()` referme automatiquement
- [x] Contrôle : `node --experimental-strip-types --conditions=react-server
      scripts/test-stripe.ts` (statuts et plans alignés avec le schéma)
- [x] **TEST** : payer en mode test → statut actif → accès débloqué
      → cycle complet vérifié le 7 août 2026 : paiement → `active` en base avec
        le bon plan et la bonne échéance ; résiliation → `canceled` et accès
        refermé ; essai → 0 € dû, carte quand même collectée.
        Rejouer : `stripe listen --forward-to localhost:3000/api/stripe/webhook`
        (le `whsec_` affiché change à chaque session, il doit aller dans
        `.env.local` — celui du dashboard Stripe est un autre)

---

## SEMAINE 3 — Finitions + lancement

### Étape 7 — PWA + emails (1 jour)
- [x] manifest + icônes générées (app/manifest.ts, app/icon.tsx, app/apple-icon.tsx)
      → installée, l'app s'ouvre sur /dashboard et non sur la landing
- [ ] Écran "installe l'app sur ton écran d'accueil"
- [x] Emails : bienvenue + programme prêt (`lib/emails.ts`)
      → API Resend en fetch direct, gabarit commun avec
        `docs/emails/confirmation.html` (à coller dans Supabase, il n'est pas
        lu par l'app). Un échec d'envoi n'interrompt jamais l'action qui l'a
        déclenché, et « programme prêt » part après l'insertion en base
      → ⚠️ sans `RESEND_API_KEY` en environnement, rien ne part et rien ne le
        signale : c'est voulu, mais ça se vérifie à la main

### Étape 8 — Légal + RGPD (1 jour)
- [x] Pages mentions légales + confidentialité + CGV
      → gabarit commun dans `app/(marketing)/legal.tsx`, liées depuis le footer,
        les CGV le sont aussi depuis /abonnement avant paiement
      → ⚠️ deux points à confirmer par Marwan : la mention « TVA non applicable,
        art. 293 B » suppose la franchise en base, et le médiateur de la
        consommation n'est pas encore nommé (adhésion obligatoire pour vendre
        à des particuliers)
- [x] /compte : export données (JSON) + suppression compte (cascade)
      → cascade vérifiée : profiles, programs, workout_logs et subscriptions
        tombent tous à 0 après suppression de l'utilisateur
- [x] Checkbox consentement à l'inscription
      → non pré-cochée, affichée à l'inscription seulement, et revérifiée dans
        l'action serveur : le `required` du navigateur ne prouve rien
- [ ] Analytics sans cookies

### Étape 9 — Bêta + lancement (3-4 jours)
- [ ] 3-5 bêta-testeurs de la commu → parcours complet
- [ ] Corrections des bugs remontés + ajustement des programmes générés
- [x] Landing page de vente finale (distincte de la landing waitlist)
      → app/(marketing)/ : promesse, problème, 3 étapes, ce que tu reçois,
        les 3 tarifs (fondateur en or), FAQ en <details> natifs, disclaimer.
        Les boutons envoient vers l'inscription tant que Stripe n'existe pas.
- [ ] Ouverture des 100 places fondateur à la liste d'attente

---

## RÈGLES DU BUILD (à relire quand tu doutes)

1. **Périmètre gelé** : toute idée hors de cette liste → `ROADMAP.md`, pas dans le code
2. **Un seul projet** : Hybrid Club. Pas d'autre chantier pendant ces 3 semaines
3. **Génération = priorité** : si une étape doit prendre plus de temps, que ce soit l'étape 3, pas le design
4. **Test après chaque étape** : ne passe à la suivante que si le TEST passe
5. **Validation en parallèle** : les stories + la landing waitlist continuent de tourner pendant le build