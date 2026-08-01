"use client";

import { useActionState } from "react";
import { enregistrerProfil, type EtatOnboarding } from "./actions";

const champ =
  "rounded-lg border border-black/15 bg-transparent px-3 py-3 text-base outline-none focus:border-black/50 dark:border-white/20 dark:focus:border-white/60";

function Champ({
  label: intitule,
  aide,
  children,
}: {
  label: string;
  aide?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{intitule}</span>
      {children}
      {aide && <span className="text-xs opacity-60">{aide}</span>}
    </label>
  );
}

export default function Formulaire() {
  const [erreur, action, enCours] = useActionState<EtatOnboarding, FormData>(
    enregistrerProfil,
    null,
  );

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col px-5 py-10">
      <h1 className="text-2xl font-semibold">On fait connaissance</h1>
      <p className="mt-1 text-sm opacity-70">
        Ces réponses servent à construire ton programme. Tu pourras les changer
        plus tard.
      </p>

      <form action={action} className="mt-8 flex flex-col gap-5">
        <Champ label="Tu es">
          <select name="sex" required defaultValue="" className={champ}>
            <option value="" disabled>
              Choisis…
            </option>
            <option value="femme">Une femme</option>
            <option value="homme">Un homme</option>
          </select>
        </Champ>

        <Champ label="Année de naissance">
          <input
            type="number"
            name="birth_year"
            required
            min={1930}
            max={2012}
            inputMode="numeric"
            placeholder="1998"
            className={champ}
          />
        </Champ>

        <Champ label="Taille (cm)">
          <input
            type="number"
            name="height_cm"
            required
            min={120}
            max={230}
            inputMode="numeric"
            placeholder="175"
            className={champ}
          />
        </Champ>

        <Champ label="Poids (kg)">
          <input
            type="number"
            name="weight_kg"
            required
            min={35}
            max={250}
            step={0.1}
            inputMode="decimal"
            placeholder="70"
            className={champ}
          />
        </Champ>

        <Champ label="Ton objectif">
          <select name="goal" required defaultValue="" className={champ}>
            <option value="" disabled>
              Choisis…
            </option>
            <option value="fessiers">Fessiers</option>
            <option value="tonification">Tonification</option>
            <option value="recomposition">Recomposition</option>
            <option value="masse">Prise de masse</option>
            <option value="force">Force</option>
            <option value="seche">Sèche</option>
          </select>
        </Champ>

        <Champ label="Ton niveau">
          <select name="level" required defaultValue="" className={champ}>
            <option value="" disabled>
              Choisis…
            </option>
            <option value="debutant">Débutant</option>
            <option value="intermediaire">Intermédiaire</option>
            <option value="avance">Avancé</option>
          </select>
        </Champ>

        <Champ label="Où tu t'entraînes">
          <select name="equipment" required defaultValue="" className={champ}>
            <option value="" disabled>
              Choisis…
            </option>
            <option value="salle">En salle de sport</option>
            <option value="maison_halteres">À la maison, avec haltères</option>
            <option value="poids_du_corps">Au poids du corps</option>
          </select>
        </Champ>

        <Champ label="Séances par semaine">
          <select
            name="days_per_week"
            required
            defaultValue=""
            className={champ}
          >
            <option value="" disabled>
              Choisis…
            </option>
            {[2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} séances
              </option>
            ))}
          </select>
        </Champ>

        <Champ label="Alimentation">
          <select name="diet" defaultValue="aucun" className={champ}>
            <option value="aucun">Aucune restriction</option>
            <option value="vegetarien">Végétarien</option>
            <option value="sans_porc">Sans porc</option>
            <option value="sans_lactose">Sans lactose</option>
            <option value="halal">Halal</option>
          </select>
        </Champ>

        <Champ
          label="Aliments que tu n'aimes pas"
          aide="Optionnel. Sépare-les par des virgules."
        >
          <textarea
            name="disliked_foods"
            rows={2}
            placeholder="brocoli, thon…"
            className={champ}
          />
        </Champ>

        {erreur && (
          <p aria-live="polite" className="text-sm text-red-700 dark:text-red-400">
            {erreur}
          </p>
        )}

        <button
          type="submit"
          disabled={enCours}
          className="rounded-lg bg-foreground px-4 py-3 text-base font-medium text-background disabled:opacity-50"
        >
          {enCours ? "Un instant…" : "Valider mon profil"}
        </button>
      </form>
    </main>
  );
}
