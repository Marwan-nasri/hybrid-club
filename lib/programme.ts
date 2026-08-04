import type { Programme } from "./prompts/program-generation.ts";
import { JOURS } from "./prompts/program-generation.ts";

export type { Programme };
export type Seance = Programme["sessions"][number];

/** Lundi = 0, pour indexer JOURS (Date.getDay() met dimanche à 0). */
export function jourActuel(maintenant = new Date()) {
  return JOURS[(maintenant.getDay() + 6) % 7];
}

export function seanceDuJour(programme: Programme, maintenant = new Date()) {
  const jour = jourActuel(maintenant);
  const entree = programme.weekly_schedule.find((j) => j.jour === jour);
  if (!entree) return null;
  return programme.sessions.find((s) => s.key === entree.seance_key) ?? null;
}

/** La prochaine séance planifiée, en repartant au lundi suivant si besoin. */
export function prochaineSeance(programme: Programme, maintenant = new Date()) {
  const depart = JOURS.indexOf(jourActuel(maintenant));
  for (let i = 1; i <= JOURS.length; i++) {
    const jour = JOURS[(depart + i) % JOURS.length];
    const entree = programme.weekly_schedule.find((j) => j.jour === jour);
    if (entree) {
      const seance = programme.sessions.find((s) => s.key === entree.seance_key);
      if (seance) return { jour, seance };
    }
  }
  return null;
}

export function trouverSeance(programme: Programme, cle: string) {
  return programme.sessions.find((s) => s.key === cle) ?? null;
}

/** Les jours où cette séance revient dans la semaine. */
export function joursDeLaSeance(programme: Programme, cle: string) {
  return programme.weekly_schedule
    .filter((j) => j.seance_key === cle)
    .map((j) => j.jour);
}

// ---------------------------------------------------------------------------
// Auto-contrôle : node --experimental-strip-types lib/programme.ts
// (silence = tout va bien)
// ---------------------------------------------------------------------------
if (process.argv?.[1]?.endsWith("lib/programme.ts")) {
  const verifier = (ok: boolean, quoi: string) => {
    if (!ok) throw new Error(`ÉCHEC : ${quoi}`);
  };

  // 2026-08-03 est un lundi, 2026-08-09 le dimanche suivant.
  const lundi = new Date("2026-08-03T10:00:00");
  const mardi = new Date("2026-08-04T10:00:00");
  const dimanche = new Date("2026-08-09T10:00:00");

  verifier(jourActuel(lundi) === "lundi", `lundi, reçu ${jourActuel(lundi)}`);
  verifier(
    jourActuel(dimanche) === "dimanche",
    `dimanche, reçu ${jourActuel(dimanche)}`,
  );

  const prog = {
    meta: { goal: "masse", weeks: 5, days_per_week: 2 },
    sessions: [
      { key: "seance_A", name: "Haut", type: "muscu", exercises: [] },
      { key: "seance_B", name: "Bas", type: "muscu", exercises: [] },
    ],
    weekly_schedule: [
      { jour: "lundi", seance_key: "seance_A" },
      { jour: "jeudi", seance_key: "seance_B" },
    ],
  } as unknown as Programme;

  verifier(seanceDuJour(prog, lundi)?.key === "seance_A", "séance du lundi");
  verifier(seanceDuJour(prog, mardi) === null, "mardi devrait être un repos");

  // Depuis mardi, la prochaine est jeudi.
  verifier(
    prochaineSeance(prog, mardi)?.jour === "jeudi",
    `prochaine depuis mardi, reçu ${prochaineSeance(prog, mardi)?.jour}`,
  );
  // Depuis dimanche, il faut repartir au lundi de la semaine suivante.
  verifier(
    prochaineSeance(prog, dimanche)?.jour === "lundi",
    `prochaine depuis dimanche, reçu ${prochaineSeance(prog, dimanche)?.jour}`,
  );
  // Depuis lundi, la prochaine est jeudi et non lundi lui-même.
  verifier(
    prochaineSeance(prog, lundi)?.jour === "jeudi",
    `prochaine depuis lundi, reçu ${prochaineSeance(prog, lundi)?.jour}`,
  );

  verifier(
    joursDeLaSeance(prog, "seance_A").join() === "lundi",
    "jours de seance_A",
  );
}
