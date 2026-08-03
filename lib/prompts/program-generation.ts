import { z } from "zod";
// Extension explicite : c'est ce qui permet de lancer lib/prompts/verif.ts
// directement avec node --experimental-strip-types, sans outil de build.
import { LIBELLES, age, type ProfilComplet } from "./profil.ts";

export const JOURS = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
] as const;

const Exercice = z.strictObject({
  name: z.string().min(2),
  sets: z.number().int().min(1).max(10),
  /** Fourchette ("8-10") ou consigne de temps ("45s") — pas un nombre. */
  reps: z.string().min(1),
  rest_sec: z.number().int().min(15).max(300),
  notes: z.string().min(3),
  progression: z.string().min(3),
});

const Bloc = z.strictObject({
  format: z.string().min(2),
  content: z.string().min(5),
});

const Seance = z.discriminatedUnion("type", [
  z.strictObject({
    key: z.string().regex(/^seance_[A-Z]$/),
    name: z.string().min(3),
    type: z.literal("muscu"),
    exercises: z.array(Exercice).min(3).max(8),
  }),
  z.strictObject({
    key: z.string().regex(/^seance_[A-Z]$/),
    name: z.string().min(3),
    type: z.literal("cardio"),
    blocks: z.array(Bloc).min(1).max(4),
  }),
]);

export const SchemaProgramme = z
  .strictObject({
    meta: z.strictObject({
      goal: z.string(),
      weeks: z.number().int().min(4).max(8),
      days_per_week: z.number().int().min(2).max(6),
    }),
    sessions: z.array(Seance).min(2).max(6),
    // Un tableau, pas un objet jour -> séance : les objets à clés dynamiques
    // ne survivent pas à la conversion en JSON Schema pour les structured
    // outputs (la contrainte sur les clés est perdue et il ne reste qu'un
    // objet vide autorisé).
    weekly_schedule: z
      .array(
        z.strictObject({
          jour: z.enum(JOURS),
          seance_key: z.string(),
        }),
      )
      .min(2)
      .max(6),
  })
  .refine(
    (p) =>
      new Set(p.weekly_schedule.map((j) => j.jour)).size ===
      p.weekly_schedule.length,
    { message: "Le même jour est programmé deux fois." },
  )
  // Erreurs qu'un JSON syntaxiquement valide peut parfaitement contenir.
  .refine(
    (p) =>
      p.weekly_schedule.every((j) =>
        p.sessions.some((s) => s.key === j.seance_key),
      ),
    { message: "Le planning référence une séance inexistante." },
  )
  .refine(
    (p) => p.weekly_schedule.length === p.meta.days_per_week,
    {
      message:
        "Le planning ne place pas exactement days_per_week jours d'entraînement.",
    },
  )
  // Une séance définie mais jamais placée dans la semaine, c'est du contenu
  // que le membre ne verra jamais. (Le nombre de séances distinctes, lui, est
  // libre : un split A/B sur 4 jours est la structure normale.)
  .refine(
    (p) =>
      p.sessions.every((s) =>
        p.weekly_schedule.some((j) => j.seance_key === s.key),
      ),
    { message: "Une séance définie n'apparaît jamais dans le planning." },
  );

export type Programme = z.infer<typeof SchemaProgramme>;

export const SYSTEME_PROGRAMME = `Tu es le coach de Hybrid Club, un club de fitness hybride (musculation + cardio).
Tu construis des programmes d'entraînement sur-mesure, sérieux et applicables.

Règles absolues :
- Tu réponds UNIQUEMENT par un objet JSON valide, sans texte autour, sans bloc markdown.
- Tu tutoies le membre dans les champs texte (notes, progression, content).
- Zéro promesse de résultat chiffré. Jamais de "tu perdras X kg" ou "en Y semaines tu auras".
- Tu ne prescris que des exercices réalisables avec le matériel indiqué. Aucune exception.
- Pas de conseil médical, pas de complément alimentaire, pas de référence au poids de corps cible.`;

export function promptProgramme(profil: ProfilComplet) {
  return `Construis le programme de ce membre.

PROFIL
- ${LIBELLES.sex[profil.sex]}, ${age(profil)} ans, ${profil.height_cm} cm, ${profil.weight_kg} kg
- Objectif : ${LIBELLES.goal[profil.goal]}
- Niveau : ${LIBELLES.level[profil.level]}
- Matériel : ${LIBELLES.equipment[profil.equipment]}
- Disponibilité : ${profil.days_per_week} séances par semaine

CONTRAINTES
- Le planning place exactement ${profil.days_per_week} jours d'entraînement dans la semaine.
- Tu définis 2 à 4 séances distinctes et tu les répètes : un split (haut/bas, push/pull/jambes)
  est la structure normale. Une même séance peut revenir plusieurs fois dans la semaine.
- Chaque séance que tu définis doit apparaître au moins une fois dans le planning.
- Au moins un jour de repos entre deux séances qui sollicitent les mêmes groupes musculaires.
- Programme sur 5 semaines.
- Chaque séance a une clé "seance_A", "seance_B", … dans l'ordre.
- Mélange muscu et cardio ("hybride") : au moins une séance de type "cardio" dès que
  le membre s'entraîne 3 fois ou plus par semaine.
- Séance muscu : 3 à 8 exercices, avec séries, fourchette de reps, repos en secondes,
  une note d'exécution concrète et une règle de progression claire.
- Séance cardio : 1 à 4 blocs (EMOM, intervalles, tempo…), chacun avec son format et son contenu détaillé.
- Nomme les séances par leur contenu ("Bas du corps — Force", "Conditioning"), pas "Séance 1".

FORMAT DE SORTIE (JSON strict, exactement ces clés)
{
  "meta": { "goal": "${profil.goal}", "weeks": 5, "days_per_week": ${profil.days_per_week} },
  "sessions": [
    {
      "key": "seance_A",
      "name": "Bas du corps — Force",
      "type": "muscu",
      "exercises": [
        { "name": "Squat gobelet", "sets": 4, "reps": "8-10", "rest_sec": 90,
          "notes": "Descends contrôlé, 2s en bas", "progression": "Ajoute 2kg quand tu fais 4x10 propre" }
      ]
    },
    {
      "key": "seance_B",
      "name": "Conditioning",
      "type": "cardio",
      "blocks": [ { "format": "EMOM 20min", "content": "Minute paire : 12 kettlebell swings. Minute impaire : 200m course." } ]
    }
  ],
  "weekly_schedule": [
    { "jour": "lundi", "seance_key": "seance_A" },
    { "jour": "mardi", "seance_key": "seance_B" },
    { "jour": "jeudi", "seance_key": "seance_A" },
    { "jour": "vendredi", "seance_key": "seance_B" }
  ]
}

"weekly_schedule" contient exactement ${profil.days_per_week} entrées, un jour ne peut apparaître
qu'une seule fois, et les jours autorisés sont : ${JOURS.join(", ")}.`;
}
