@AGENTS.md
# CLAUDE.md — Hybrid Club

Ce fichier cadre le développement du projet. Lis-le avant toute action.

## Le projet

**Hybrid Club** est un SaaS de fitness (PWA) qui génère des programmes d'entraînement hybrides (muscu + cardio) et des cadres nutritionnels 100% personnalisés par IA, selon le profil de chaque membre. C'est l'app officielle de la communauté "Hybride". Public : hommes et femmes, principalement 18-35 ans, audience venue de Snapchat.

Docs de référence dans `docs/` — les consulter en cas de doute :
- `architecture.md` — structure technique complète
- `nutrition-spec.md` — logique du module nutrition
- `schema.sql` — schéma de la base
- `plan-execution.md` — plan étape par étape et avancement

## Stack

- **Next.js 14+ (App Router)** + TypeScript
- **Tailwind CSS** pour le style
- **Supabase** (Postgres + Auth + RLS, région EU/Francfort) — `@supabase/ssr`
- **API Anthropic** (claude-sonnet-4-6) pour la génération
- **Stripe** (Checkout + Customer Portal + Webhooks) pour les abonnements
- **Resend** ou **Brevo** pour les emails
- **Vercel** pour l'hébergement

## Règles non négociables

### Sécurité
- L'appel à l'API Anthropic se fait **UNIQUEMENT côté serveur** (API routes). Jamais depuis le navigateur.
- La `SUPABASE_SERVICE_ROLE_KEY` et l'`ANTHROPIC_API_KEY` restent côté serveur exclusivement.
- **RLS activée sur toutes les tables.** Chaque nouvelle table doit avoir ses policies définies dans la foulée.
- L'écriture dans `subscriptions` se fait **uniquement via les webhooks Stripe** (service role). Ne jamais faire confiance au retour client pour valider un paiement.

### Nutrition (santé — critique)
- Les calories et macros se calculent en **TypeScript pur** (formule Mifflin-St Jeor), **JAMAIS par l'IA**. L'IA ne génère que les idées de repas.
- Garde-fous codés en dur, jamais contournables :
  - Plancher : 1 400 kcal (femme) / 1 600 kcal (homme)
  - Déficit plafonné à −20%
  - IMC < 18,5 → pas d'objectif déficitaire, message orientant vers un professionnel de santé
- Aucune promesse de résultat chiffré ("perds X kg en Y jours" interdit).
- Disclaimer nutrition toujours visible : repères généraux, pas une prescription diététique.

### RGPD
- Données hébergées en région EU (Francfort) — déjà configuré, ne pas changer.
- Consentement explicite à l'inscription (checkbox non pré-cochée).
- Fonctions export des données (JSON) + suppression du compte (cascade) obligatoires en v1.
- Analytics sans cookies uniquement. Pas de Google Analytics.
- Ne pas demander ni stocker de données médicales.

## Validation des données générées

Tout JSON retourné par l'API Anthropic doit être **validé avec Zod** avant insertion en base. Si la validation échoue, ne pas insérer : réessayer ou renvoyer une erreur propre.

## Périmètre V1 — STRICT

**Dans la v1 (uniquement ça) :**
1. Auth email + onboarding (8 écrans)
2. Génération programme + nutrition
3. Dashboard séance du jour + écran séance (saisie charges) + historique
4. Écran nutrition (macros + idées repas)
5. Stripe checkout fondateur + webhooks + accès conditionné
6. PWA + pages légales + export/suppression données + emails transactionnels

**HORS v1 (noter dans `ROADMAP.md`) :**
Régénération automatique, notifications push, graphiques avancés, liste de courses, parrainage, tier coaching premium, sync rôle Discord, module cycle.

**Règle d'or : toute fonctionnalité hors de cette liste va dans `ROADMAP.md`, jamais dans le code.**

## Conventions de code

- Composants React fonctionnels, hooks. Pas de classes.
- Server Components par défaut ; `"use client"` seulement si nécessaire.
- Nommage : fichiers en kebab-case, composants en PascalCase, variables en camelCase.
- Textes de l'interface en **français**, tutoiement, vocabulaire "club" (membre, rejoindre, carte fondateur).
- Mobile-first systématiquement.
- Pas de sur-ingénierie : la solution la plus simple qui marche.

## Structure des dossiers

app/
  (marketing)/   → landing, pages légales
  (auth)/        → connexion, inscription
  (app)/         → onboarding, dashboard, seance, nutrition, progression, compte
  api/           → generate, stripe/*, waitlist
lib/
  supabase/      → clients browser + server
  anthropic.ts
  stripe.ts
  nutrition.ts   → calculs déterministes
  prompts/       → program-generation, nutrition-generation
components/
middleware.ts

## Workflow attendu

1. Avancer étape par étape selon `docs/plan-execution.md`.
2. Après chaque étape, proposer un test simple avant de continuer.
3. En cas de doute, demander plutôt que supposer.
4. Toute modif de schéma se répercute dans `docs/schema.sql`.