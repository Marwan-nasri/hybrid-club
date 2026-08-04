"use client";

import { useActionState, useState } from "react";
import { supprimerCompte, type EtatSuppression } from "./actions";
import { CONFIRMATION } from "./confirmation";

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
        className="text-sm font-medium text-alerte underline underline-offset-4"
      >
        Supprimer mon compte
      </button>
    );
  }

  return (
    <form
      action={action}
      className="rounded-xl border border-alerte/40 bg-alerte/5 p-5"
    >
      <p className="text-sm font-medium">
        Supprimer définitivement ton compte ?
      </p>
      <p className="mt-2 text-sm text-attenue">
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
          className="champ h-14 px-4 text-base uppercase tracking-widest"
        />
      </label>

      {erreur && (
        <p aria-live="polite" className="mt-2 text-sm text-alerte">
          {erreur}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setOuvert(false)}
          className="bouton-secondaire flex-1 py-3.5 text-sm"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={enCours}
          className="flex-1 rounded-xl bg-alerte py-3.5 font-display text-sm uppercase tracking-wider text-fond transition-transform active:translate-y-px disabled:opacity-40"
        >
          {enCours ? "Suppression…" : "Supprimer"}
        </button>
      </div>
    </form>
  );
}
