import type { ProfilNutrition } from "@/lib/nutrition";

/** Le profil tel qu'il sort de `profiles`, une fois l'onboarding complété. */
export type ProfilComplet = ProfilNutrition & {
  level: "debutant" | "intermediaire" | "avance";
  equipment: "salle" | "maison_halteres" | "poids_du_corps";
  diet: "aucun" | "vegetarien" | "sans_porc" | "sans_lactose" | "halal";
  disliked_foods: string | null;
};

// Les enums de la base sont des slugs ; l'IA travaille mieux avec des libellés
// en français. Une seule table de correspondance, partagée par les deux prompts.
export const LIBELLES = {
  sex: { femme: "une femme", homme: "un homme" },
  goal: {
    fessiers: "développer les fessiers",
    tonification: "se tonifier",
    recomposition: "recomposition corporelle (perdre du gras et prendre du muscle)",
    masse: "prendre de la masse musculaire",
    force: "gagner en force",
    seche: "sécher (perdre du gras)",
  },
  level: {
    debutant: "débutant (moins de 6 mois de pratique)",
    intermediaire: "intermédiaire (6 mois à 2 ans)",
    avance: "avancé (plus de 2 ans)",
  },
  equipment: {
    salle: "salle de sport complète (machines, barres, haltères)",
    maison_halteres: "à la maison, avec une paire d'haltères et un tapis",
    poids_du_corps: "au poids du corps uniquement, sans matériel",
  },
  diet: {
    aucun: "aucune restriction alimentaire",
    vegetarien: "végétarien",
    sans_porc: "sans porc",
    sans_lactose: "sans lactose",
    halal: "halal",
  },
} as const;

export function age(profil: ProfilComplet, aujourdhui = new Date()) {
  return aujourdhui.getFullYear() - profil.birth_year;
}
