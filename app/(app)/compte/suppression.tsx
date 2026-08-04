"use client";

import { useActionState, useState } from "react";
import {
  CONFIRMATION,
  supprimerCompte,
  type EtatSuppression,
} from "./actions";

export default function Suppression() {
  const [ouvert, setOuvert] = useState(false);
  const [erreur, action, enCours] = useActionState<EtatSuppression, FormData>(
    supprimerCompte,
    null,
  );

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="text-sm font-medium text-red-700 underline dark:text-red-400"
      >
        Supprimer mon compte
      </button>
    );
  }

  return (
    <form
      action={action}
      className="rounded-xl border border-red-500/40 bg-red-500/5 p-4"
    >
      <p className="text-sm font-medium">
        Supprimer définitivement ton compte ?
      </p>
      <p className="mt-1 text-sm opacity-80">
        Ton profil, tes programmes et tout ton historique de séances seront
        effacés. C&apos;est immédiat et irréversible — pense à exporter tes
        données avant.
      </p>

      <label className="mt-4 flex flex-col gap-1.5">
        <span className="text-sm">
          Écris <strong>{CONFIRMATION}</strong> pour confirmer
        </span>
        <input
          type="text"
          name="confirmation"
          required
          autoComplete="off"
          autoCapitalize="characters"
          className="rounded-lg border border-black/15 bg-transparent px-3 py-3 text-base outline-none focus:border-red-600 dark:border-white/20"
        />
      </label>

      {erreur && (
        <p aria-live="polite" className="mt-2 text-sm text-red-700 dark:text-red-400">
          {erreur}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setOuvert(false)}
          className="flex-1 rounded-lg border border-black/15 py-3 text-sm font-medium dark:border-white/20"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={enCours}
          className="flex-1 rounded-lg bg-red-700 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {enCours ? "Suppression…" : "Supprimer"}
        </button>
      </div>
    </form>
  );
}
