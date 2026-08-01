import { z } from "zod";
import type { Besoins } from "@/lib/nutrition";
import { LIBELLES, type ProfilComplet } from "./profil.ts";

/**
 * Texte légal, écrit en dur : il ne doit jamais dépendre de ce que l'IA renvoie.
 * docs/nutrition-spec.md §7.
 */
export const DISCLAIMER =
  "Repères généraux calculés à partir de ton profil — ce n'est pas une prescription " +
  "diététique. En cas de pathologie, de trouble du comportement alimentaire ou de " +
  "doute, parles-en à un professionnel de santé.";

// La répartition par repas est un calcul : elle reste en TypeScript, l'IA ne
// reçoit que les cibles déjà calculées.
const REPARTITION = [
  { moment: "petit_dejeuner", libelle: "Petit-déjeuner", part: 0.25 },
  { moment: "dejeuner", libelle: "Déjeuner", part: 0.35 },
  { moment: "collation", libelle: "Collation", part: 0.1 },
  { moment: "diner", libelle: "Dîner", part: 0.3 },
] as const;

export const MOMENTS = REPARTITION.map((r) => r.moment) as unknown as [
  "petit_dejeuner",
  "dejeuner",
  "collation",
  "diner",
];

export function ciblesParRepas(kcal: number) {
  return REPARTITION.map((r) => ({
    moment: r.moment,
    libelle: r.libelle,
    target_kcal: Math.round((kcal * r.part) / 10) * 10,
  }));
}

const Option = z.strictObject({
  name: z.string().min(5),
  approx: z.strictObject({
    kcal: z.number().int().min(50).max(2000),
    prot_g: z.number().int().min(0).max(150),
  }),
  why: z.string().min(5),
});

/** Ce que l'IA a le droit de produire : uniquement les idées, aucun chiffre de cadrage. */
export const SchemaIdeesRepas = z.strictObject({
  philosophy: z.string().min(20),
  meals: z
    .array(
      z.strictObject({
        moment: z.enum(MOMENTS),
        options: z.array(Option).min(2).max(3),
      }),
    )
    .length(REPARTITION.length),
  goal_tips: z.array(z.string().min(10)).min(3).max(4),
  grocery_staples: z.array(z.string().min(2)).min(10).max(20),
});

export type IdeesRepas = z.infer<typeof SchemaIdeesRepas>;

/** Le JSON stocké dans `programs.nutrition_json` : chiffres du TS, idées de l'IA. */
export function assemblerNutrition(besoins: Besoins, idees: IdeesRepas) {
  const cibles = ciblesParRepas(besoins.kcal);
  return {
    calories_target: besoins.kcal,
    protein_g: besoins.prot_g,
    carbs_g: besoins.gluc_g,
    fat_g: besoins.lip_g,
    tdee: besoins.tdee,
    avertissement: besoins.avertissement ?? null,
    philosophy: idees.philosophy,
    daily_structure: "3 repas + 1 collation",
    meals: cibles.map((cible) => ({
      ...cible,
      options:
        idees.meals.find((m) => m.moment === cible.moment)?.options ?? [],
    })),
    goal_tips: idees.goal_tips,
    grocery_staples: idees.grocery_staples,
    disclaimer: DISCLAIMER,
  };
}

export const SYSTEME_NUTRITION = `Tu es le coach nutrition de Hybrid Club.
Tu proposes des idées de repas simples, à la portée de quelqu'un qui fait ses courses
chez Carrefour ou Lidl en France, et qui n'est pas cuisinier.

Règles absolues :
- Tu réponds UNIQUEMENT par un objet JSON valide, sans texte autour, sans bloc markdown.
- Tu ne calcules JAMAIS les calories ni les macros de la journée : elles te sont données, tu les respectes.
- Tu tutoies le membre. Ton direct, zéro moralisation, zéro culpabilisation.
- Interdits : la notion d'aliment "interdit", le jeûne, les compléments alimentaires
  (la whey peut être citée comme option pratique, rien d'autre), toute promesse de résultat chiffré,
  toute allusion au poids ou à l'apparence du membre.`;

export function promptNutrition(profil: ProfilComplet, besoins: Besoins) {
  const cibles = ciblesParRepas(besoins.kcal);
  const detestes = profil.disliked_foods?.trim();

  return `Propose les idées de repas de ce membre.

PROFIL
- ${LIBELLES.sex[profil.sex]}, objectif : ${LIBELLES.goal[profil.goal]}
- ${profil.days_per_week} séances par semaine
- Alimentation : ${LIBELLES.diet[profil.diet]}
${detestes ? `- N'aime pas, à ne jamais proposer : ${detestes}` : "- Aucun aliment à éviter"}

CADRE DE LA JOURNÉE (calculé, non négociable)
- ${besoins.kcal} kcal
- Protéines ${besoins.prot_g} g · Lipides ${besoins.lip_g} g · Glucides ${besoins.gluc_g} g

CIBLES PAR REPAS
${cibles.map((c) => `- ${c.moment} (${c.libelle}) : environ ${c.target_kcal} kcal`).join("\n")}

CONTRAINTES
- Exactement un objet par moment listé ci-dessus, dans cet ordre, avec 2 ou 3 options chacun.
- Chaque option reste à ±10% de la cible calorique de son repas.
- "approx" donne ton estimation en kcal et en protéines pour cette option : sois réaliste.
- "why" : une phrase courte qui explique ce que l'option apporte pour CET objectif.
- Adapte le style à l'objectif : volume et satiété si l'objectif est de perdre du gras
  (légumes, protéines maigres), densité calorique pratique si c'est de prendre de la masse
  (riz, avoine, oléagineux).
- Des plats que la cible connaît : bowls, wraps, pâtes complètes, poulet-riz, skyr, omelettes.
- "grocery_staples" : 10 à 20 basiques à toujours avoir, cohérents avec les repas proposés.

FORMAT DE SORTIE (JSON strict, exactement ces clés)
{
  "philosophy": "1 ou 2 phrases sur l'approche pour cet objectif",
  "meals": [
    {
      "moment": "petit_dejeuner",
      "options": [
        { "name": "Bowl skyr, flocons d'avoine, banane, beurre de cacahuète",
          "approx": { "kcal": 460, "prot_g": 32 },
          "why": "Des protéines dès le matin et de l'énergie stable pour ta séance" }
      ]
    }
  ],
  "goal_tips": ["3 ou 4 conseils concrets liés à l'objectif"],
  "grocery_staples": ["…"]
}`;
}
