import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Nutrition } from "@/lib/prompts/nutrition-generation";
import AutresIdees from "./autres-idees";

function Macro({ valeur, libelle }: { valeur: number; libelle: string }) {
  return (
    <div className="flex-1 rounded-xl border border-black/10 py-3 text-center dark:border-white/15">
      <p className="text-xl font-semibold tabular-nums">{valeur}g</p>
      <p className="text-xs uppercase tracking-wide opacity-50">{libelle}</p>
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
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-5 py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Ta nutrition</h1>
        <p className="mt-1 text-sm opacity-70">{n.daily_structure}</p>
      </header>

      <section>
        <p className="text-center text-5xl font-semibold tabular-nums">
          {n.calories_target}
        </p>
        <p className="text-center text-sm uppercase tracking-wide opacity-50">
          kcal par jour
        </p>
        <div className="mt-4 flex gap-2">
          <Macro valeur={n.protein_g} libelle="Protéines" />
          <Macro valeur={n.carbs_g} libelle="Glucides" />
          <Macro valeur={n.fat_g} libelle="Lipides" />
        </div>
      </section>

      {n.avertissement && (
        <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          {n.avertissement}
        </p>
      )}

      <p className="text-sm opacity-80">{n.philosophy}</p>

      {n.meals.map((repas) => (
        <section
          key={repas.moment}
          className="rounded-2xl border border-black/10 p-5 dark:border-white/15"
        >
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-lg font-semibold">{repas.libelle}</h2>
            <span className="shrink-0 text-sm tabular-nums opacity-60">
              ~{repas.target_kcal} kcal
            </span>
          </div>

          <ul className="mt-4 flex flex-col gap-4">
            {repas.options.map((option) => (
              <li key={option.name}>
                <p className="font-medium">{option.name}</p>
                <p className="mt-0.5 text-sm tabular-nums opacity-60">
                  ~{option.approx.kcal} kcal · {option.approx.prot_g}g de
                  protéines
                </p>
                <p className="mt-1 text-sm opacity-70">{option.why}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <AutresIdees />

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wide opacity-50">
          À retenir
        </h2>
        <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm">
          {n.goal_tips.map((conseil) => (
            <li key={conseil}>{conseil}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wide opacity-50">
          Tes basiques de courses
        </h2>
        <p className="mt-2 text-sm opacity-80">
          {n.grocery_staples.join(" · ")}
        </p>
      </section>

      {/* docs/nutrition-spec.md §7 : visible, jamais replié. */}
      <p className="border-t border-black/10 pt-5 text-xs leading-relaxed opacity-60 dark:border-white/15">
        {n.disclaimer}
      </p>
    </main>
  );
}
