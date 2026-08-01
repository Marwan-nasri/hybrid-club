"use client";

import { useActionState } from "react";
import { authentifier, type EtatAuth } from "./actions";

export default function Connexion() {
  const [etat, action, enCours] = useActionState<EtatAuth, FormData>(
    authentifier,
    null,
  );

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-5 py-10">
      <h1 className="text-2xl font-semibold">Bienvenue</h1>
      <p className="mt-1 text-sm opacity-70">
        Connecte-toi ou crée ton compte pour continuer.
      </p>

      <form action={action} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="toi@exemple.fr"
            className="rounded-lg border border-black/15 px-3 py-3 text-base outline-none focus:border-black/50 dark:border-white/20 dark:focus:border-white/60"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Mot de passe</span>
          <input
            type="password"
            name="motDePasse"
            required
            minLength={8}
            autoComplete="current-password"
            className="rounded-lg border border-black/15 px-3 py-3 text-base outline-none focus:border-black/50 dark:border-white/20 dark:focus:border-white/60"
          />
          <span className="text-xs opacity-60">8 caractères minimum.</span>
        </label>

        {etat && (
          <p
            aria-live="polite"
            className={`text-sm ${etat.ok ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
          >
            {etat.message}
          </p>
        )}

        <button
          type="submit"
          name="mode"
          value="connexion"
          disabled={enCours}
          className="rounded-lg bg-foreground px-4 py-3 text-base font-medium text-background disabled:opacity-50"
        >
          {enCours ? "Un instant…" : "Se connecter"}
        </button>

        <button
          type="submit"
          name="mode"
          value="inscription"
          disabled={enCours}
          className="rounded-lg border border-black/15 px-4 py-3 text-base font-medium disabled:opacity-50 dark:border-white/20"
        >
          Créer un compte
        </button>
      </form>
    </main>
  );
}
