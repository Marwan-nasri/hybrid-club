"use client";

import { useActionState, useState } from "react";
import { authentifier, type EtatAuth } from "./actions";

const champ =
  "rounded-lg border border-black/15 px-3 py-3 text-base outline-none " +
  "focus:border-black/50 dark:border-white/20 dark:focus:border-white/60";

export default function Connexion() {
  const [mode, setMode] = useState<"connexion" | "inscription">("connexion");
  // Champs contrôlés : une action de formulaire réinitialise les champs non
  // contrôlés à la soumission, et retaper son mot de passe après chaque
  // erreur est le meilleur moyen de faire abandonner quelqu'un.
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");

  const [etat, action, enCours] = useActionState<EtatAuth, FormData>(
    authentifier,
    null,
  );

  const inscription = mode === "inscription";

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-5 py-10">
      <h1 className="text-2xl font-semibold">
        {inscription ? "Rejoins le club" : "Bon retour"}
      </h1>
      <p className="mt-1 text-sm opacity-70">
        {inscription
          ? "Crée ton compte pour construire ton programme."
          : "Connecte-toi pour retrouver ton programme."}
      </p>

      {/* Le mode est un choix explicite : deux boutons d'envoi côte à côte ne
          disent pas au membre lequel fait quoi. */}
      <div
        role="tablist"
        aria-label="Connexion ou inscription"
        className="mt-6 flex rounded-lg border border-black/15 p-1 dark:border-white/20"
      >
        {(["connexion", "inscription"] as const).map((valeur) => (
          <button
            key={valeur}
            type="button"
            role="tab"
            aria-selected={mode === valeur}
            onClick={() => setMode(valeur)}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              mode === valeur
                ? "bg-foreground text-background"
                : "opacity-60"
            }`}
          >
            {valeur === "connexion" ? "Se connecter" : "Créer un compte"}
          </button>
        ))}
      </div>

      <form action={action} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="mode" value={mode} />

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="toi@exemple.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={champ}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Mot de passe</span>
          <input
            type="password"
            name="motDePasse"
            required
            minLength={8}
            // Le navigateur propose un mot de passe fort à l'inscription et
            // celui qui est enregistré à la connexion : ce n'est pas le même.
            autoComplete={inscription ? "new-password" : "current-password"}
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            className={champ}
          />
          {inscription && (
            <span className="text-xs opacity-60">8 caractères minimum.</span>
          )}
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
          disabled={enCours}
          className="rounded-lg bg-foreground px-4 py-3 text-base font-medium text-background disabled:opacity-50"
        >
          {enCours
            ? "Un instant…"
            : inscription
              ? "Créer mon compte"
              : "Se connecter"}
        </button>
      </form>
    </main>
  );
}
