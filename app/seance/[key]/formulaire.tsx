"use client";

import { useActionState } from "react";
import type { Seance } from "@/lib/programme";
import { validerSeance, type EtatSeance } from "./actions";

/** Ce qui a été saisi la dernière fois, pour se situer sans quitter l'écran. */
export type Precedent = Record<string, { reps: number | null; charge_kg: number | null }[]>;

// h-14 et text-lg : la saisie se fait en salle, souvent à une main, parfois
// les mains moites. Des champs plus petits se ratent.
const champ =
  "h-14 w-full rounded-lg border border-black/15 bg-transparent text-center text-lg " +
  "font-medium outline-none focus:border-black/60 dark:border-white/20 dark:focus:border-white/70";

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
    <form action={action} className="flex flex-col gap-8 pb-32">
      <input type="hidden" name="seance_key" value={seance.key} />

      {seance.type === "muscu"
        ? seance.exercises.map((exercice, i) => {
            const dernier = precedent[exercice.name];
            return (
              <section key={exercice.name}>
                <h2 className="text-lg font-semibold">{exercice.name}</h2>
                <p className="mt-0.5 text-sm opacity-70">
                  {exercice.sets} × {exercice.reps} · repos {exercice.rest_sec}s
                </p>
                <p className="mt-1 text-sm opacity-60">{exercice.notes}</p>

                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide opacity-50">
                    <span className="w-8 shrink-0">Série</span>
                    <span className="flex-1 text-center">Reps</span>
                    <span className="flex-1 text-center">Charge (kg)</span>
                  </div>

                  {Array.from({ length: exercice.sets }, (_, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <span className="w-8 shrink-0 text-sm font-medium opacity-60">
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
                        placeholder={
                          dernier?.[j]?.charge_kg?.toString() ?? "—"
                        }
                        aria-label={`${exercice.name}, série ${j + 1}, charge en kilos`}
                        className={`flex-1 ${champ}`}
                      />
                    </div>
                  ))}
                </div>

                <p className="mt-3 text-sm opacity-60">
                  Progression : {exercice.progression}
                </p>
              </section>
            );
          })
        : seance.blocks.map((bloc) => (
            <section key={bloc.format}>
              <h2 className="text-lg font-semibold">{bloc.format}</h2>
              <p className="mt-1 opacity-80">{bloc.content}</p>
            </section>
          ))}

      {erreur && (
        <p aria-live="polite" className="text-sm text-red-700 dark:text-red-400">
          {erreur}
        </p>
      )}

      {/* Collé en bas : atteignable au pouce sans remonter toute la page. */}
      <div className="fixed inset-x-0 bottom-0 border-t border-black/10 bg-white/95 px-5 py-4 backdrop-blur dark:border-white/15 dark:bg-black/95">
        <button
          type="submit"
          disabled={enCours}
          className="mx-auto flex h-14 w-full max-w-sm items-center justify-center rounded-lg bg-foreground text-base font-medium text-background disabled:opacity-50"
        >
          {enCours ? "Un instant…" : "Séance terminée"}
        </button>
      </div>
    </form>
  );
}
