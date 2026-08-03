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
- [ ] Push GitHub + deploy Vercel + variables d'env → tester le compte sur l'URL en ligne

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
- [ ] Dashboard /dashboard : séance du jour selon le planning
- [ ] Écran séance /seance/[id] : liste exercices + saisie séries/reps/charges
- [ ] Bouton "séance terminée" → insert `workout_logs`
- [ ] Vue programme complet /programme

### Étape 5 — Nutrition (1 jour)
- [ ] Écran /nutrition : macros en gros + idées de repas en cartes
- [ ] Bouton "d'autres idées" → régénère seulement les repas
- [ ] Disclaimer visible

### Étape 6 — Paiement Stripe (2 jours)
- [ ] Produits Stripe : fondateur 49€/an, mensuel 9,99€, annuel 79€
- [ ] /api/stripe/checkout → redirection Stripe Checkout
- [ ] /api/stripe/webhook → upsert `subscriptions` (SEULE source de vérité)
- [ ] Middleware : accès (app) seulement si abonnement actif
- [ ] Stripe Customer Portal pour gérer/annuler
- [ ] **TEST** : payer en mode test → statut actif → accès débloqué

---

## SEMAINE 3 — Finitions + lancement

### Étape 7 — PWA + emails (1 jour)
- [ ] manifest.json + icônes + écran "installe l'app sur ton écran d'accueil"
- [ ] Emails : bienvenue + programme prêt

### Étape 8 — Légal + RGPD (1 jour)
- [ ] Pages mentions légales + confidentialité
- [ ] /compte : export données (JSON) + suppression compte (cascade)
- [ ] Checkbox consentement à l'inscription
- [ ] Analytics sans cookies

### Étape 9 — Bêta + lancement (3-4 jours)
- [ ] 3-5 bêta-testeurs de la commu → parcours complet
- [ ] Corrections des bugs remontés + ajustement des programmes générés
- [ ] Landing page de vente finale (distincte de la landing waitlist)
- [ ] Ouverture des 100 places fondateur à la liste d'attente

---

## RÈGLES DU BUILD (à relire quand tu doutes)

1. **Périmètre gelé** : toute idée hors de cette liste → `ROADMAP.md`, pas dans le code
2. **Un seul projet** : Hybrid Club. Pas d'autre chantier pendant ces 3 semaines
3. **Génération = priorité** : si une étape doit prendre plus de temps, que ce soit l'étape 3, pas le design
4. **Test après chaque étape** : ne passe à la suivante que si le TEST passe
5. **Validation en parallèle** : les stories + la landing waitlist continuent de tourner pendant le build