"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { authentifier, type EtatAuth } from "./actions";

export type Mode = "connexion" | "inscription";

export default function Formulaire({
  modeInitial,
}: {
  modeInitial: Mode;
}) {
  // Le mode arrive du serveur : « Rejoindre le club » depuis la landing doit
  // ouvrir l'onglet Inscription, pas obliger à le chercher.
  const [mode, setMode] = useState<Mode>(modeInitial);
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
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-12">
      <div className="cascade flex flex-col">
        <p className="surtitre">Hybrid Club</p>
        <h1 className="mt-3 text-5xl">
          {inscription ? "Rejoins le club" : "Bon retour"}
        </h1>
        <p className="mt-3 text-sm text-gris">
          {inscription
            ? "Crée ton compte pour construire ton programme."
            : "Connecte-toi pour retrouver ton programme."}
        </p>

        {/* Le mode est un choix explicite : deux boutons d'envoi côte à côte
            ne disent pas au membre lequel fait quoi. */}
        <div
          role="tablist"
          aria-label="Connexion ou inscription"
          className="mt-8 flex gap-1 rounded-xl border border-ligne bg-carbone p-1"
        >
          {(["connexion", "inscription"] as const).map((valeur) => (
            <button
              key={valeur}
              type="button"
              role="tab"
              aria-selected={mode === valeur}
              onClick={() => setMode(valeur)}
              className={`flex-1 rounded-lg py-2.5 font-display text-sm uppercase tracking-wider transition-colors ${
                mode === valeur ? "degrade text-texte" : "text-gris"
              }`}
            >
              {valeur === "connexion" ? "Connexion" : "Inscription"}
            </button>
          ))}
        </div>

        <form action={action} className="mt-6 flex flex-col gap-5">
          <input type="hidden" name="mode" value={mode} />

          <label className="flex flex-col gap-2">
            <span className="surtitre">Email</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              inputMode="email"
              placeholder="toi@exemple.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="champ h-14 px-4 text-base"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="surtitre">Mot de passe</span>
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
              className="champ h-14 px-4 text-base"
            />
            {inscription && (
              <span className="text-xs text-gris">8 caractères minimum.</span>
            )}
          </label>

          {/* RGPD : jamais pré-cochée, et rendue seulement à l'inscription —
              on ne redemande pas son consentement à chaque connexion. */}
          {inscription && (
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="consentement"
                required
                className="mt-0.5 size-5 shrink-0 accent-[var(--color-flux)]"
              />
              <span className="text-xs leading-relaxed text-gris">
                J&apos;accepte que mes réponses servent à construire mon
                programme et mon cadre nutritionnel, et j&apos;ai lu la{" "}
                <Link
                  href="/confidentialite"
                  target="_blank"
                  className="text-texte underline underline-offset-2"
                >
                  politique de confidentialité
                </Link>
                .
              </span>
            </label>
          )}

          {etat && (
            <p
              aria-live="polite"
              className="text-sm"
              style={{
                color: etat.ok ? "var(--color-flux)" : "var(--color-force)",
              }}
            >
              {etat.message}
            </p>
          )}

          <button
            type="submit"
            disabled={enCours}
            className="bouton-accent mt-2 flex h-14 items-center justify-center text-lg"
          >
            {enCours
              ? "Un instant…"
              : inscription
                ? "Créer mon compte"
                : "Se connecter"}
          </button>
        </form>
      </div>
    </main>
  );
}
