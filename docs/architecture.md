# HYBRID CLUB — Architecture technique v1

## 1. Stack

| Couche | Choix | Pourquoi |
|---|---|---|
| Framework | **Next.js 14+ (App Router)** | Front + API routes dans un seul projet, parfait pour Vercel |
| UI | **React + Tailwind CSS** | Stack habituelle |
| Base de données | **Supabase (région EU — Francfort)** | Postgres + Auth + Row Level Security, RGPD-friendly |
| Auth | **Supabase Auth** (email/password) | Intégré, gratuit, gère les sessions |
| Paiement | **Stripe** (Checkout + Customer Portal + Webhooks) | Abonnements mensuel/annuel + offre fondateur |
| IA | **API Anthropic** (claude-sonnet-5) | Génération des programmes et cadres nutrition |
| Emails | **Resend** ou **Brevo** | Transactionnels + campagnes |
| Hébergement | **Vercel** | Deploy automatique depuis GitHub |
| PWA | **next-pwa** ou manifest manuel | Installation écran d'accueil |

---

## 2. Structure du projet

app/
  (marketing)/            # Pages publiques
    page.tsx              # Landing page
    mentions-legales/
    confidentialite/
  (auth)/
    connexion/
    inscription/
  (app)/                  # Zone membre (protégée)
    onboarding/           # Questionnaire initial
    dashboard/            # Écran du jour
    programme/            # Vue programme complet
    seance/[id]/          # Séance en cours (saisie charges)
    nutrition/            # Cadre alimentaire
    progression/          # Historique + stats
    compte/               # Abonnement, données, suppression
  api/
    generate/route.ts     # Génération programme (appel Anthropic)
    stripe/
      checkout/route.ts
      webhook/route.ts
    waitlist/route.ts
lib/
  supabase/               # Clients (server + browser)
  anthropic.ts            # Client + prompts
  stripe.ts
  nutrition.ts            # Calculs déterministes
  prompts/
    program-generation.ts     # LE fichier critique
    nutrition-generation.ts
components/
middleware.ts             # Protection des routes
public/
  manifest.json           # PWA
  icons/

---

## 3. Format du programme généré (JSON)

Le prompt Anthropic doit retourner STRICTEMENT ce format (validé avec Zod avant insertion) :

{
  "meta": { "goal": "recomposition", "weeks": 5, "days_per_week": 4 },
  "sessions": [
    {
      "key": "seance_A",
      "name": "Bas du corps — Force",
      "type": "muscu",
      "exercises": [
        {
          "name": "Squat gobelet",
          "sets": 4, "reps": "8-10", "rest_sec": 90,
          "notes": "Descends contrôlé, 2s en bas",
          "progression": "Ajoute 2kg quand tu fais 4x10 propre"
        }
      ]
    },
    {
      "key": "seance_B",
      "name": "Conditioning",
      "type": "cardio",
      "blocks": [
        { "format": "EMOM 20min", "content": "..." }
      ]
    }
  ],
  "weekly_schedule": { "lundi": "seance_A", "mercredi": "seance_B" }
}

Nutrition :

{
  "calories_target": 2100,
  "protein_g": 130, "carbs_g": 220, "fat_g": 65,
  "meal_examples": [ { "moment": "petit-dej", "options": ["...", "..."] } ],
  "disclaimer": "Repères généraux, pas une prescription diététique"
}

---

## 4. Les 3 flux critiques

### Flux A — Onboarding → Programme
1. Inscription (Supabase Auth) → insert `profiles` vide (trigger automatique)
2. Questionnaire (8 écrans mobiles, une question par écran)
3. `POST /api/generate` → construit le prompt depuis le profil → appel Anthropic → validation Zod → insert `programs` (version 1, active)
4. Écran "Ton programme est prêt" → dashboard

⚠️ La génération prend 15-30s : écran d'attente engageant obligatoire, pas un spinner nu.

### Flux B — Paiement (Stripe)
1. Fin d'onboarding → `POST /api/stripe/checkout` → redirection Stripe Checkout
2. Webhook `checkout.session.completed` → upsert `subscriptions`
3. Webhook `customer.subscription.updated/deleted` → mise à jour statut
4. Middleware : accès à `(app)/` seulement si `subscriptions.status = 'active'`
5. Annulation/carte : Stripe Customer Portal (zéro code)

**Règle d'or : ne jamais faire confiance au retour client. Seuls les webhooks écrivent dans `subscriptions`.**

### Flux C — Régénération (V2, pas en v1)
Cron Vercel → repère les programmes proches de `valid_until` → email → nouveau programme version N+1 enrichi de l'historique `workout_logs`.

---

## 5. RGPD — à câbler dès le départ

- Supabase région **EU (Francfort)** — irréversible, déjà fait
- Consentement explicite à l'inscription (checkbox non pré-cochée)
- Page `/compte` : export des données (JSON) + suppression du compte (cascade) — obligatoires
- Pas de données santé sensibles en v1 : poids/taille/objectif suffisent
- Politique de confidentialité avant le lancement ; relecture juriste ~200-500€ recommandée
- Analytics sans cookies (Plausible ou Vercel Analytics) — pas Google Analytics

---

## 6. Variables d'environnement

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # serveur uniquement, jamais exposée
ANTHROPIC_API_KEY=                # serveur uniquement
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
RESEND_API_KEY=

⚠️ L'appel Anthropic se fait **uniquement côté serveur** (API route) — jamais depuis le navigateur, sinon la clé fuite.