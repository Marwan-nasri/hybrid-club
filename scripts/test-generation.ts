/**
 * TEST CRITIQUE de l'étape 3 : générer un programme sur 10 profils très
 * différents et les relire à la main. Ne touche pas à la base.
 *
 * Lancer :
 *   node --experimental-strip-types --conditions=react-server \
 *        --env-file=.env.local scripts/test-generation.ts
 *
 * Coût : ~7 centimes par profil.
 */
import { genererPourProfil } from "../lib/anthropic.ts";
import type { ProfilComplet } from "../lib/prompts/profil.ts";

const PROFILS: Array<{ nom: string; profil: ProfilComplet }> = [
  {
    nom: "Femme débutante, maison, tonification",
    profil: { sex: "femme", birth_year: 2001, height_cm: 165, weight_kg: 62, goal: "tonification", level: "debutant", equipment: "maison_halteres", days_per_week: 3, diet: "aucun", disliked_foods: null },
  },
  {
    nom: "Femme débutante, poids du corps, fessiers",
    profil: { sex: "femme", birth_year: 2004, height_cm: 160, weight_kg: 55, goal: "fessiers", level: "debutant", equipment: "poids_du_corps", days_per_week: 3, diet: "aucun", disliked_foods: null },
  },
  {
    nom: "Femme intermédiaire, salle, fessiers",
    profil: { sex: "femme", birth_year: 1998, height_cm: 168, weight_kg: 64, goal: "fessiers", level: "intermediaire", equipment: "salle", days_per_week: 4, diet: "aucun", disliked_foods: null },
  },
  {
    nom: "Femme avancée, salle, sèche, 5j",
    profil: { sex: "femme", birth_year: 1994, height_cm: 170, weight_kg: 72, goal: "seche", level: "avance", equipment: "salle", days_per_week: 5, diet: "aucun", disliked_foods: "fromage de chèvre" },
  },
  {
    nom: "Femme intermédiaire, maison, recomposition, végétarienne",
    profil: { sex: "femme", birth_year: 1996, height_cm: 163, weight_kg: 60, goal: "recomposition", level: "intermediaire", equipment: "maison_halteres", days_per_week: 4, diet: "vegetarien", disliked_foods: "tofu" },
  },
  {
    nom: "Homme débutant, poids du corps, recomposition",
    profil: { sex: "homme", birth_year: 2003, height_cm: 178, weight_kg: 80, goal: "recomposition", level: "debutant", equipment: "poids_du_corps", days_per_week: 3, diet: "aucun", disliked_foods: null },
  },
  {
    nom: "Homme intermédiaire, salle, masse, 5j",
    profil: { sex: "homme", birth_year: 1999, height_cm: 180, weight_kg: 75, goal: "masse", level: "intermediaire", equipment: "salle", days_per_week: 5, diet: "aucun", disliked_foods: null },
  },
  {
    nom: "Homme avancé, salle, force, 6j",
    profil: { sex: "homme", birth_year: 1992, height_cm: 183, weight_kg: 88, goal: "force", level: "avance", equipment: "salle", days_per_week: 6, diet: "aucun", disliked_foods: null },
  },
  {
    nom: "Homme débutant, maison, sèche, 2j, halal",
    profil: { sex: "homme", birth_year: 1997, height_cm: 175, weight_kg: 95, goal: "seche", level: "debutant", equipment: "maison_halteres", days_per_week: 2, diet: "halal", disliked_foods: "brocoli, thon" },
  },
  {
    // Garde-fou : IMC 16,9 + objectif sèche -> maintenance forcée.
    nom: "Homme 19 ans, IMC bas, sèche (garde-fou attendu)",
    profil: { sex: "homme", birth_year: 2007, height_cm: 185, weight_kg: 58, goal: "seche", level: "debutant", equipment: "salle", days_per_week: 3, diet: "aucun", disliked_foods: null },
  },
];

const ligne = "─".repeat(72);
let echecs = 0;

for (const [index, { nom, profil }] of PROFILS.entries()) {
  console.log(`\n${ligne}\n${index + 1}/10 · ${nom}\n${ligne}`);
  const depart = Date.now();

  try {
    const { program_json, nutrition_json, besoins } =
      await genererPourProfil(profil);

    console.log(
      `⏱  ${((Date.now() - depart) / 1000).toFixed(1)}s · ${besoins.kcal} kcal ` +
        `(TDEE ${besoins.tdee}, ${besoins.ajustement_pct}%) · ` +
        `P ${nutrition_json.protein_g}g L ${nutrition_json.fat_g}g G ${nutrition_json.carbs_g}g`,
    );
    if (nutrition_json.avertissement) {
      console.log(`⚠  ${nutrition_json.avertissement}`);
    }

    console.log(
      `\nPLANNING : ${program_json.weekly_schedule
        .map((j) => `${j.jour} → ${j.seance_key}`)
        .join(" · ")}`,
    );

    for (const seance of program_json.sessions) {
      console.log(`\n  [${seance.key}] ${seance.name} (${seance.type})`);
      if (seance.type === "muscu") {
        for (const e of seance.exercises) {
          console.log(
            `    · ${e.name} — ${e.sets}×${e.reps}, repos ${e.rest_sec}s`,
          );
          console.log(`      ${e.notes} | progression : ${e.progression}`);
        }
      } else {
        for (const b of seance.blocks) {
          console.log(`    · ${b.format} — ${b.content}`);
        }
      }
    }

    console.log(`\nNUTRITION : ${nutrition_json.philosophy}`);
    for (const repas of nutrition_json.meals) {
      console.log(`  ${repas.libelle} (~${repas.target_kcal} kcal)`);
      for (const o of repas.options) {
        console.log(`    · ${o.name} — ${o.approx.kcal} kcal, ${o.approx.prot_g}g prot`);
      }
    }
    console.log(`  Conseils : ${nutrition_json.goal_tips.join(" / ")}`);
    console.log(`  Courses : ${nutrition_json.grocery_staples.join(", ")}`);
  } catch (erreur) {
    echecs += 1;
    console.error(`❌ ÉCHEC : ${erreur instanceof Error ? erreur.message : erreur}`);
  }
}

console.log(`\n${ligne}`);
console.log(`${PROFILS.length - echecs}/${PROFILS.length} générations réussies.`);
if (echecs > 0) process.exitCode = 1;
