"use client";

import { useActionState } from "react";
import { renvoyerConfirmation, type EtatRenvoi } from "./actions";

export default function Renvoyer({ email }: { email: string }) {
  const [etat, action, enCours] = useActionState<EtatRenvoi, FormData>(
    renvoyerConfirmation,
    null,
  );

  return (
    <form action={action} className="mt-4 flex flex-col gap-3">
      <input type="hidden" name="email" value={email} />
      <button
        type="submit"
        disabled={enCours}
        className="bouton-secondaire flex h-14 items-center justify-center text-base"
      >
        {enCours ? "Un instant…" : "Renvoyer l'email"}
      </button>
      {etat && (
        <p
          aria-live="polite"
          className="text-center text-sm"
          style={{
            color: etat.ok ? "var(--color-flux)" : "var(--color-force)",
          }}
        >
          {etat.message}
        </p>
      )}
    </form>
  );
}
