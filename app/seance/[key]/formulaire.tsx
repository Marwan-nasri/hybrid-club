"use client";

import { useActionState } from "react";
import type { Seance } from "@/lib/programme";
import { validerSeance, type EtatSeance } from "./actions";

/** Ce qui a été saisi la dernière fois, pour se situer sans quitter l'écran. */
export type Precedent = Record<
  string,
  { reps: number | null; charge_kg: number | null }[]
>;

// h-16 et text-2xl : la saisie se fait debout, à une main, parfois les mains
// moites. Tout ce qui est plus petit se rate.
const champ =
  "champ chiffres h-16 w-full text-center text-2xl font-semibold";

export default function Formulaire({
  seance,
  precedent,
}: {
  seance: Seance;
  precedent: Precedent;
}) {
  const [erreur, action, enCours] = useActionState<EtatSeance, FormData>(
    validerSeance,
    null,
  );

  return (
    <form action={action} className="flex flex-col gap-12 pb-40">
      <input type="hidden" name="seance_key" value={seance.key} />

      {seance.type === "muscu"
        ? seance.exercises.map((exercice, i) => {
            const dernier = precedent[exercice.name];
            return (
              <section key={exercice.name}>
                <div className="flex items-baseline gap-3">
                  <span className="chiffres font-display text-3xl font-bold text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-2xl font-semibold">{exercice.name}</h2>
                </div>

                <p className="surtitre mt-2">
                  {exercice.sets} séries · {exercice.reps} reps · repos{" "}
                  {exercice.rest_sec}s
                </p>
                <p className="mt-2 text-sm text-attenue">{exercice.notes}</p>

                <div className="mt-5 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-6 shrink-0" />
                    <span className="surtitre flex-1 text-center">Reps</span>
                    <span className="surtitre flex-1 text-center">Kg</span>
                  </div>

                  {Array.from({ length: exercice.sets }, (_, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <span className="chiffres w-6 shrink-0 font-display text-lg text-attenue">
                        {j + 1}
                      </span>
                      <input
                        type="number"
                        name={`reps-${i}-${j}`}
                        inputMode="numeric"
                        min={0}
                        max={200}
                        placeholder={
                          dernier?.[j]?.reps?.toString() ?? exercice.reps
                        }
                        aria-label={`${exercice.name}, série ${j + 1}, répétitions`}
                        className={`flex-1 ${champ}`}
                      />
                      <input
                        type="number"
                        name={`charge-${i}-${j}`}
                        inputMode="decimal"
                        step={0.5}
                        min={0}
                        max={500}
                        placeholder={dernier?.[j]?.charge_kg?.toString() ?? "—"}
                        aria-label={`${exercice.name}, série ${j + 1}, charge en kilos`}
                        className={`flex-1 ${champ}`}
                      />
                    </div>
                  ))}
                </div>

                <p className="mt-4 border-l-2 border-accent pl-3 text-sm text-attenue">
                  {exercice.progression}
                </p>
              </section>
            );
          })
        : seance.blocks.map((bloc, i) => (
            <section key={bloc.format}>
              <div className="flex items-baseline gap-3">
                <span className="chiffres font-display text-3xl font-bold text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="text-2xl font-semibold">{bloc.format}</h2>
              </div>
              <p className="mt-3 leading-relaxed">{bloc.content}</p>
            </section>
          ))}

      {erreur && (
        <p aria-live="polite" className="text-sm text-alerte">
          {erreur}
        </p>
      )}

      {/* Collé en bas : atteignable au pouce sans remonter toute la page. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-bord bg-fond/95 px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 backdrop-blur-md">
        <button
          type="submit"
          disabled={enCours}
          className="bouton-accent mx-auto flex h-16 w-full max-w-md items-center justify-center text-xl"
        >
          {enCours ? "Enregistrement…" : "Séance terminée"}
        </button>
      </div>
    </form>
  );
}
