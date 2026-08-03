/**
 * Auto-contrôle des schémas de validation.
 * Lancer : node --experimental-strip-types lib/prompts/verif.ts  (silence = OK)
 *
 * On ne teste pas les prompts eux-mêmes (c'est du texte), mais tout ce qui
 * décide si un JSON généré entre en base ou non.
 */
import { calculerBesoins } from "../nutrition.ts";
import { SchemaProgramme } from "./program-generation.ts";
import {
  DISCLAIMER,
  SchemaIdeesRepas,
  assemblerNutrition,
  ciblesParRepas,
} from "./nutrition-generation.ts";

const verifier = (ok: boolean, quoi: string) => {
  if (!ok) throw new Error(`ÉCHEC : ${quoi}`);
};

// --- Programme --------------------------------------------------------------

const seanceMuscu = {
  key: "seance_A",
  name: "Bas du corps — Force",
  type: "muscu",
  exercises: [
    {
      name: "Squat gobelet",
      sets: 4,
      reps: "8-10",
      rest_sec: 90,
      notes: "Descends contrôlé, 2s en bas",
      progression: "Ajoute 2kg quand tu fais 4x10 propre",
    },
    {
      name: "Fentes marchées",
      sets: 3,
      reps: "10-12",
      rest_sec: 75,
      notes: "Genou arrière proche du sol",
      progression: "Passe à 3x14 avant d'ajouter du poids",
    },
    {
      name: "Hip thrust",
      sets: 4,
      reps: "10",
      rest_sec: 90,
      notes: "Marque une pause en haut",
      progression: "Ajoute 5kg quand les 4x10 passent",
    },
  ],
};

const seanceCardio = {
  key: "seance_B",
  name: "Conditioning",
  type: "cardio",
  blocks: [
    {
      format: "EMOM 20min",
      content: "Minute paire : 12 swings. Minute impaire : 200m course.",
    },
  ],
};

const programme = {
  meta: { goal: "recomposition", weeks: 5, days_per_week: 2 },
  sessions: [seanceMuscu, seanceCardio],
  weekly_schedule: [
    { jour: "lundi", seance_key: "seance_A" },
    { jour: "jeudi", seance_key: "seance_B" },
  ],
};

verifier(
  SchemaProgramme.safeParse(programme).success,
  "un programme valide est rejeté",
);

// Un planning qui pointe vers une séance absente : JSON valide, programme cassé.
verifier(
  !SchemaProgramme.safeParse({
    ...programme,
    weekly_schedule: [
      { jour: "lundi", seance_key: "seance_A" },
      { jour: "jeudi", seance_key: "seance_Z" },
    ],
  }).success,
  "planning vers une séance inexistante accepté",
);

// Le cas qui a fait échouer les 10 premières générations : un split A/B placé
// deux fois chacun sur 4 jours. C'est la structure NORMALE d'un programme,
// elle doit passer — le nombre de séances distinctes n'a pas à égaler
// days_per_week.
verifier(
  SchemaProgramme.safeParse({
    meta: { goal: "masse", weeks: 5, days_per_week: 4 },
    sessions: [seanceMuscu, seanceCardio],
    weekly_schedule: [
      { jour: "lundi", seance_key: "seance_A" },
      { jour: "mardi", seance_key: "seance_B" },
      { jour: "jeudi", seance_key: "seance_A" },
      { jour: "vendredi", seance_key: "seance_B" },
    ],
  }).success,
  "un split A/B sur 4 jours est rejeté",
);

// Le planning ne place pas le nombre de jours demandé.
verifier(
  !SchemaProgramme.safeParse({
    ...programme,
    meta: { ...programme.meta, days_per_week: 4 },
  }).success,
  "planning à 2 jours accepté alors que days_per_week vaut 4",
);

// Une séance définie mais jamais placée : du contenu invisible pour le membre.
verifier(
  !SchemaProgramme.safeParse({
    ...programme,
    // seance_B est définie mais le planning ne place que seance_A.
    weekly_schedule: [
      { jour: "lundi", seance_key: "seance_A" },
      { jour: "jeudi", seance_key: "seance_A" },
    ],
  }).success,
  "séance jamais placée dans le planning acceptée",
);

// Deux séances le même jour : impossible à afficher sur le dashboard.
verifier(
  !SchemaProgramme.safeParse({
    ...programme,
    weekly_schedule: [
      { jour: "lundi", seance_key: "seance_A" },
      { jour: "lundi", seance_key: "seance_B" },
    ],
  }).success,
  "même jour programmé deux fois accepté",
);

// Une séance muscu qui renvoie des blocs de cardio (ou l'inverse).
verifier(
  !SchemaProgramme.safeParse({
    ...programme,
    sessions: [{ ...seanceCardio, key: "seance_A", type: "muscu" }, seanceCardio],
  }).success,
  "séance muscu sans exercices acceptée",
);

// Jour inventé.
verifier(
  !SchemaProgramme.safeParse({
    ...programme,
    weekly_schedule: [
      { jour: "lundy", seance_key: "seance_A" },
      { jour: "jeudi", seance_key: "seance_B" },
    ],
  }).success,
  "jour de la semaine invalide accepté",
);

// --- Nutrition --------------------------------------------------------------

const besoins = calculerBesoins(
  {
    sex: "femme",
    birth_year: 1998,
    height_cm: 165,
    weight_kg: 65,
    goal: "recomposition",
    days_per_week: 4,
  },
  new Date("2026-01-01"),
);

const cibles = ciblesParRepas(besoins.kcal);
const sommeCibles = cibles.reduce((t, c) => t + c.target_kcal, 0);
verifier(
  Math.abs(sommeCibles - besoins.kcal) <= 20,
  `répartition par repas ${sommeCibles} vs ${besoins.kcal} kcal`,
);

const option = (nom: string) => ({
  name: nom,
  approx: { kcal: 450, prot_g: 30 },
  why: "Des protéines et de l'énergie stable",
});

const idees = {
  philosophy: "On garde les protéines hautes et on mange à ta faim, sans se priver.",
  meals: cibles.map((c) => ({
    moment: c.moment,
    options: [option(`Option 1 pour ${c.moment}`), option(`Option 2 pour ${c.moment}`)],
  })),
  goal_tips: [
    "Vise 30g de protéines à chaque repas",
    "Bois de l'eau avant de te resservir",
    "Prépare ta collation la veille",
  ],
  grocery_staples: [
    "skyr", "flocons d'avoine", "œufs", "poulet", "riz complet",
    "pâtes complètes", "thon", "brocoli", "tomates", "bananes",
  ],
};

verifier(
  SchemaIdeesRepas.safeParse(idees).success,
  "des idées de repas valides sont rejetées",
);

// Un moment manquant casserait l'écran nutrition en silence.
verifier(
  !SchemaIdeesRepas.safeParse({ ...idees, meals: idees.meals.slice(0, 3) }).success,
  "repas manquant accepté",
);

// Une seule option par repas : le membre n'a plus de choix.
verifier(
  !SchemaIdeesRepas.safeParse({
    ...idees,
    meals: idees.meals.map((m) => ({ ...m, options: [m.options[0]] })),
  }).success,
  "repas à une seule option accepté",
);

const assemble = assemblerNutrition(besoins, SchemaIdeesRepas.parse(idees));
verifier(
  assemble.calories_target === besoins.kcal &&
    assemble.protein_g === besoins.prot_g &&
    assemble.carbs_g === besoins.gluc_g &&
    assemble.fat_g === besoins.lip_g,
  "les macros assemblées ne viennent pas du calcul TypeScript",
);
verifier(assemble.disclaimer === DISCLAIMER, "disclaimer absent ou modifié");
verifier(
  assemble.meals.length === cibles.length &&
    assemble.meals.every((m) => m.options.length >= 2 && m.target_kcal > 0),
  "assemblage des repas incomplet",
);
