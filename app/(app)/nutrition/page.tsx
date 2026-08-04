import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Nutrition } from "@/lib/prompts/nutrition-generation";
import AutresIdees from "./autres-idees";

export const metadata = { title: "Nutrition" };

function Macro({ valeur, libelle }: { valeur: number; libelle: string }) {
  return (
    <div className="flex-1 border-t-2 border-ligne pt-3">
      <p className="chiffres font-display text-3xl">{valeur}g</p>
      <p className="surtitre mt-0.5">{libelle}</p>
    </div>
  );
}

export default async function PageNutrition() {
  const supabase = await createClient();
  const { data: session } = await supabase.auth.getClaims();

  const { data: ligne } = await supabase
    .from("programs")
    .select("nutrition_json")
    .eq("user_id", session!.claims.sub)
    .eq("status", "active")
    .maybeSingle<{ nutrition_json: Nutrition }>();

  if (!ligne) redirect("/generation");
  const n = ligne.nutrition_json;

  return (
    <main className="mx-auto w-full max-w-md px-5 pt-10">
      <div className="cascade flex flex-col gap-10">
        <header>
          <p className="surtitre">Ton cadre du jour</p>
          {/* Le chiffre qui compte, en très grand : c'est le repère que le
              membre vient chercher. */}
          <p className="chiffres mt-2 font-display text-8xl font-bold leading-none">
            {n.calories_target}
          </p>
          <p className="surtitre mt-1">kcal par jour · {n.daily_structure}</p>

          <div className="mt-8 flex gap-4">
            <Macro valeur={n.protein_g} libelle="Protéines" />
            <Macro valeur={n.carbs_g} libelle="Glucides" />
            <Macro valeur={n.fat_g} libelle="Lipides" />
          </div>
        </header>

        {n.avertissement && (
          <p className="border-l-2 border-force pl-4 text-sm">
            {n.avertissement}
          </p>
        )}

        <p className="text-sm leading-relaxed text-gris">{n.philosophy}</p>

        {n.meals.map((repas) => (
          <section key={repas.moment} className="border-t border-ligne pt-6">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-2xl">{repas.libelle}</h2>
              <span className="chiffres shrink-0 font-display text-sm uppercase tracking-wider text-gris">
                ≈ {repas.target_kcal} kcal
              </span>
            </div>

            <ul className="mt-5 flex flex-col gap-5">
              {repas.options.map((option) => (
                <li key={option.name}>
                  <p className="font-medium">{option.name}</p>
                  <p className="chiffres mt-1 text-sm uppercase tracking-wider text-gris">
                    {option.approx.kcal} kcal · {option.approx.prot_g}g prot
                  </p>
                  <p className="mt-1 text-sm text-gris">{option.why}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <AutresIdees />

        <section className="border-t border-ligne pt-6">
          <h2 className="surtitre">À retenir</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {n.goal_tips.map((conseil) => (
              <li key={conseil} className="flex gap-3 text-sm">
                <span aria-hidden className="text-gris">
                  —
                </span>
                {conseil}
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-ligne pt-6">
          <h2 className="surtitre">Tes basiques de courses</h2>
          <p className="mt-3 text-sm leading-relaxed text-gris">
            {n.grocery_staples.join(" · ")}
          </p>
        </section>

        {/* docs/nutrition-spec.md §7 : visible, jamais replié. */}
        <p className="border-t border-ligne pt-6 text-xs leading-relaxed text-gris">
          {n.disclaimer}
        </p>
      </div>
    </main>
  );
}
