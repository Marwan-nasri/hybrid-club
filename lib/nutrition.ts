/**
 * Calcul des besoins caloriques et des macros — 100% déterministe.
 * L'IA ne touche JAMAIS à ces chiffres (docs/nutrition-spec.md §2).
 */

export type Sexe = "femme" | "homme";
export type Objectif =
  | "seche"
  | "recomposition"
  | "tonification"
  | "fessiers"
  | "masse"
  | "force";

export type ProfilNutrition = {
  sex: Sexe;
  birth_year: number;
  height_cm: number;
  weight_kg: number;
  goal: Objectif;
  days_per_week: number;
};

export type Besoins = {
  kcal: number;
  prot_g: number;
  lip_g: number;
  gluc_g: number;
  /** Métabolisme de base (Mifflin-St Jeor). */
  mb: number;
  /** Dépense totale estimée, avant ajustement objectif. */
  tdee: number;
  imc: number;
  /** Écart au TDEE réellement appliqué, en % (négatif = déficit). */
  ajustement_pct: number;
  /** Présent uniquement si un garde-fou a modifié le calcul. */
  avertissement?: string;
};

// Milieu des fourchettes de docs/nutrition-spec.md §2c et §2d.
const OBJECTIFS: Record<
  Objectif,
  { ajustement: number; prot_g_kg: number; lip_g_kg: number }
> = {
  seche: { ajustement: -0.18, prot_g_kg: 2.1, lip_g_kg: 0.8 },
  recomposition: { ajustement: -0.08, prot_g_kg: 1.9, lip_g_kg: 0.9 },
  tonification: { ajustement: 0, prot_g_kg: 1.7, lip_g_kg: 1.0 },
  fessiers: { ajustement: 0.08, prot_g_kg: 1.9, lip_g_kg: 1.0 },
  masse: { ajustement: 0.12, prot_g_kg: 1.9, lip_g_kg: 1.0 },
  force: { ajustement: 0.08, prot_g_kg: 1.8, lip_g_kg: 1.0 },
};

/** Garde-fous non contournables — docs/nutrition-spec.md §2c. */
const PLANCHER_KCAL: Record<Sexe, number> = { femme: 1400, homme: 1600 };
const DEFICIT_MAX = -0.2;
const IMC_MAIGREUR = 18.5;

const MESSAGE_IMC =
  "Ton IMC est en dessous de 18,5. On ne te propose pas de déficit calorique : " +
  "ton cadre est calculé à la maintenance. Pour aller plus loin, parles-en à un " +
  "professionnel de santé.";

const MESSAGE_PLANCHER =
  "Ton cadre a été relevé au minimum qu'on accepte de proposer. En dessous, " +
  "ce n'est plus tenable ni sain.";

function facteurActivite(joursParSemaine: number) {
  if (joursParSemaine <= 2) return 1.375;
  if (joursParSemaine <= 4) return 1.5;
  return 1.65;
}

export function calculerBesoins(
  profil: ProfilNutrition,
  aujourdhui = new Date(),
): Besoins {
  const { sex, height_cm, weight_kg, goal } = profil;
  const age = aujourdhui.getFullYear() - profil.birth_year;

  // Mifflin-St Jeor
  const mb =
    10 * weight_kg +
    6.25 * height_cm -
    5 * age +
    (sex === "homme" ? 5 : -161);

  const tdee = mb * facteurActivite(profil.days_per_week);
  const imc = weight_kg / (height_cm / 100) ** 2;

  let avertissement: string | undefined;
  let ajustement = OBJECTIFS[goal].ajustement;

  // IMC de maigreur : aucun objectif déficitaire, quel que soit le goal choisi.
  if (imc < IMC_MAIGREUR && ajustement < 0) {
    ajustement = 0;
    avertissement = MESSAGE_IMC;
  }
  ajustement = Math.max(ajustement, DEFICIT_MAX);

  const plancher = PLANCHER_KCAL[sex];
  // Arrondi à 50 kcal : le plancher en est un multiple, il tient après arrondi.
  let kcal = Math.round((tdee * (1 + ajustement)) / 50) * 50;
  if (kcal < plancher) {
    kcal = plancher;
    avertissement ??= MESSAGE_PLANCHER;
  }

  // Ordre imposé : protéines, puis lipides, les glucides prennent le reste.
  const prot_g = Math.round(OBJECTIFS[goal].prot_g_kg * weight_kg);
  const lip_g = Math.round(OBJECTIFS[goal].lip_g_kg * weight_kg);
  const gluc_g = Math.max(0, Math.round((kcal - prot_g * 4 - lip_g * 9) / 4));

  return {
    kcal,
    prot_g,
    lip_g,
    gluc_g,
    mb: Math.round(mb),
    tdee: Math.round(tdee),
    imc: Math.round(imc * 10) / 10,
    ajustement_pct: Math.round((kcal / tdee - 1) * 100),
    avertissement,
  };
}

// ---------------------------------------------------------------------------
// Auto-contrôle : node --experimental-strip-types lib/nutrition.ts
// (silence = tout va bien)
// ---------------------------------------------------------------------------
if (process.argv?.[1]?.endsWith("lib/nutrition.ts")) {
  const verifier = (ok: boolean, quoi: string) => {
    if (!ok) throw new Error(`ÉCHEC : ${quoi}`);
  };
  const le = new Date("2026-01-01");

  // L'exemple de docs/nutrition-spec.md §2e (la spec annonce 1900 / 125 / 58 /
  // 220 : mêmes kcal, les macros bougent d'un gramme selon l'arrondi).
  const exemple = calculerBesoins(
    {
      sex: "femme",
      birth_year: 1998,
      height_cm: 165,
      weight_kg: 65,
      goal: "recomposition",
      days_per_week: 4,
    },
    le,
  );
  verifier(exemple.kcal === 1900, `spec §2e kcal, reçu ${exemple.kcal}`);
  verifier(exemple.prot_g === 124, `spec §2e prot, reçu ${exemple.prot_g}`);
  verifier(exemple.lip_g === 59, `spec §2e lip, reçu ${exemple.lip_g}`);
  verifier(exemple.gluc_g === 218, `spec §2e gluc, reçu ${exemple.gluc_g}`);

  // Plancher : petite femme sédentaire en sèche → jamais sous 1400.
  const plancher = calculerBesoins(
    {
      sex: "femme",
      birth_year: 1970,
      height_cm: 150,
      weight_kg: 48,
      goal: "seche",
      days_per_week: 2,
    },
    le,
  );
  verifier(plancher.kcal >= 1400, `plancher femme, reçu ${plancher.kcal}`);
  verifier(!!plancher.avertissement, "plancher sans avertissement");

  // IMC < 18,5 + objectif sèche → maintenance, pas de déficit.
  const maigreur = calculerBesoins(
    {
      sex: "homme",
      birth_year: 2000,
      height_cm: 185,
      weight_kg: 58,
      goal: "seche",
      days_per_week: 3,
    },
    le,
  );
  // Tolérance de 25 kcal partout : c'est la moitié du pas d'arrondi, donc le
  // maximum que l'arrondi à 50 peut retirer à la cible.
  verifier(maigreur.imc < 18.5, `IMC du cas maigreur, reçu ${maigreur.imc}`);
  verifier(
    maigreur.kcal >= maigreur.tdee - 25,
    `déficit malgré IMC < 18,5 : ${maigreur.kcal} vs TDEE ${maigreur.tdee}`,
  );
  verifier(maigreur.avertissement === MESSAGE_IMC, "message IMC absent");

  // Déficit jamais au-delà de −20%, et cohérence kcal/macros sur tous les cas.
  for (const goal of Object.keys(OBJECTIFS) as Objectif[]) {
    for (const sex of ["femme", "homme"] as Sexe[]) {
      const b = calculerBesoins(
        {
          sex,
          birth_year: 1995,
          height_cm: 175,
          weight_kg: 80,
          goal,
          days_per_week: 4,
        },
        le,
      );
      verifier(
        b.kcal >= b.tdee * 0.8 - 25,
        `${sex}/${goal} : déficit > 20% (${b.kcal} vs TDEE ${b.tdee})`,
      );
      verifier(b.kcal >= PLANCHER_KCAL[sex], `${sex}/${goal} : sous le plancher`);
      const somme = b.prot_g * 4 + b.lip_g * 9 + b.gluc_g * 4;
      verifier(
        Math.abs(somme - b.kcal) <= 4,
        `${sex}/${goal} : macros ${somme} vs ${b.kcal} kcal`,
      );
    }
  }
}
