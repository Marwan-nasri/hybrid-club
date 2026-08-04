"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AutresIdees() {
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function regenerer() {
    setEnCours(true);
    setErreur(null);
    try {
      const reponse = await fetch("/api/nutrition", { method: "POST" });
      if (!reponse.ok) {
        const { erreur } = await reponse.json().catch(() => ({}));
        throw new Error(erreur ?? "Réessaie dans un instant.");
      }
      // Les données viennent d'un Server Component : refresh() les relit
      // sans recharger la page.
      router.refresh();
    } catch (e) {
      setErreur((e as Error).message);
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={regenerer}
        disabled={enCours}
        className="bouton-secondaire flex h-14 items-center justify-center text-base"
      >
        {enCours ? "On cherche…" : "D'autres idées"}
      </button>
      {erreur && (
        <p aria-live="polite" className="text-sm text-force">
          {erreur}
        </p>
      )}
    </div>
  );
}
