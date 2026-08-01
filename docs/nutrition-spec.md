# HYBRID CLUB — Spec module Nutrition v1

## 1. Principe

Deux étages, bien séparés dans le code :
1. **Le calcul calories/macros** : des maths pures, en TypeScript, PAS par IA
   (déterministe, vérifiable, gratuit, instantané)
2. **Les idées de repas** : générées par l'API Anthropic à partir des macros calculées

Ne demande JAMAIS à l'IA de calculer les calories — elle peut se tromper et tu ne
peux pas auditer. L'IA ne fait que la partie créative (les plats).

---

## 2. Étage 1 — Calcul des besoins (lib/nutrition.ts)

### a) Métabolisme de base — formule Mifflin-St Jeor

Homme : MB = 10 × poids(kg) + 6,25 × taille(cm) − 5 × âge + 5
Femme : MB = 10 × poids(kg) + 6,25 × taille(cm) − 5 × âge − 161

### b) Dépense totale (TDEE) — facteur d'activité

Basé sur days_per_week du profil :

| Séances/semaine | Facteur |
|---|---|
| 2 | × 1,375 |
| 3-4 | × 1,50 |
| 5-6 | × 1,65 |

TDEE = MB × facteur

### c) Ajustement selon l'objectif

| Objectif | Ajustement calorique | Logique |
|---|---|---|
| **Perte de gras / sèche** | TDEE − 15 à 20% | Déficit modéré, durable, préserve le muscle |
| **Recomposition** | TDEE − 5 à 10% | Léger déficit, protéines hautes |
| **Tonification** | TDEE (maintenance) | Le muscle se dessine à l'entraînement |
| **Prise de fessiers** | TDEE + 5 à 10% | Léger surplus |
| **Prise de masse** | TDEE + 10 à 15% | Surplus contrôlé |
| **Force** | TDEE + 5 à 10% | Performance, récupération |

**Garde-fous à coder en dur :**
- Jamais en dessous de **1 400 kcal (femme)** / **1 600 kcal (homme)** quel que soit le calcul
- Si l'IMC calculé est < 18,5 : pas d'objectif déficitaire proposé, message
  orientant vers un professionnel de santé
- Déficit max affiché : −20%, jamais plus, même si le membre le demande

### d) Répartition des macros

Ordre de calcul : protéines d'abord, lipides ensuite, glucides = le reste.

| Objectif | Protéines | Lipides | Glucides |
|---|---|---|---|
| Sèche / perte de gras | 2,0-2,2 g/kg | 0,8 g/kg | reste |
| Recomposition | 1,8-2,0 g/kg | 0,9 g/kg | reste |
| Tonification | 1,6-1,8 g/kg | 1,0 g/kg | reste |
| Fessiers / masse | 1,8-2,0 g/kg | 1,0 g/kg | reste |
| Force | 1,8 g/kg | 1,0 g/kg | reste |

glucides_g = (calories − protéines_g×4 − lipides_g×9) / 4

### e) Exemple de sortie

Femme, 28 ans, 65 kg, 165 cm, 4 séances/sem, objectif recomposition :
- MB = 1 383 kcal → TDEE = 2 075 kcal → cible = **1 900 kcal**
- Protéines **125 g** · Lipides **58 g** · Glucides **220 g**

---

## 3. Étage 2 — Génération des idées de repas (IA)

### Format de sortie attendu (validé Zod)

{
  "philosophy": "1-2 phrases sur l'approche pour CET objectif",
  "daily_structure": "3 repas + 1 collation",
  "meals": [
    {
      "moment": "petit_dejeuner",
      "target_kcal": 450,
      "options": [
        {
          "name": "Bowl skyr, flocons d'avoine, banane, beurre de cacahuète",
          "approx": { "kcal": 460, "prot_g": 32 },
          "why": "Protéines dès le matin, énergie stable pour la séance"
        }
      ]
    }
  ],
  "goal_tips": ["3-4 conseils spécifiques à l'objectif"],
  "grocery_staples": ["liste de ~15 basiques à toujours avoir"],
  "disclaimer": "Repères généraux basés sur ton profil — pas une prescription diététique. Pathologie, TCA ou doute : consulte un professionnel de santé."
}

### Règles à imposer dans le prompt

- Cuisine simple et accessible en France (courses Carrefour/Lidl), plats que la cible
  connaît : bowls, wraps, pâtes complètes, poulet-riz revisité, skyr, etc.
- 2-3 options par repas pour la variété — le membre choisit, pas de menu imposé
- Chaque option ~±10% du target_kcal du repas
- Adapter le style à l'objectif : volume et satiété en sèche (légumes, protéines
  maigres), densité calorique pratique en masse (riz, avoine, oléagineux, shakers)
- Ton Hybrid Club : direct, tutoiement, zéro moralisation
- INTERDIT dans la sortie : discours culpabilisant, "aliments interdits",
  jeûnes agressifs, compléments (hors whey mentionnée comme option pratique)

---

## 4. Onboarding — questions nutrition

Deux écrans à inclure dans le questionnaire :

1. **Régime particulier ?** → aucun / végétarien / sans porc / sans lactose / halal
2. **Aliments que tu détestes ?** → champ libre court (injecté dans le prompt)

Ne PAS demander : antécédents médicaux, TCA, pathologies — hors périmètre v1,
et ça évite de stocker des données de santé sensibles (RGPD).

---

## 5. Écran /nutrition — UX

- En haut : les 3 macros + calories en gros (le "cadre" du membre)
- Répartition par repas avec les options en cartes
- Bouton "D'autres idées" → régénère uniquement les meals (pas les macros)
- Le disclaimer visible en bas de page, pas caché
- v2 (pas maintenant) : liste de courses générée, suivi des repas cochés

---

## 6. Recalcul

Les macros se recalculent quand :
- Le poids est mis à jour
- L'objectif change

→ Même versioning que les programmes : on archive, on ne modifie jamais en place.

---

## 7. Le point légal

Hybrid Club fournit des repères nutritionnels généraux calculés par formules publiques +
des idées de repas. PAS de prescription diététique personnalisée (profession réglementée
en France — diététicien). La frontière tient tant que :
- le disclaimer est présent et visible
- aucune donnée médicale n'est demandée
- aucun résultat chiffré n'est promis ("perds 5kg en 1 mois" = interdit)
- les garde-fous caloriques (§2c) sont codés en dur