"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// La génération prend 15 à 30s. On raconte ce qui se passe plutôt que de
// laisser tourner un spinner : le membre doit comprendre qu'on travaille.
const ETAPES = [
  "On lit ton profil…",
  "On calcule ton cadre nutritionnel…",
  "On construit tes séances…",
  "On répartit ta semaine…",
  "On choisit tes idées de repas…",
  "On vérifie tout avant de te le montrer…",
];

const DUREE_ESTIMEE_MS = 30_000;

export default function Attente() {
  const router = useRouter();
  const [etape, setEtape] = useState(0);
  const [erreur, setErreur] = useState<string | null>(null);
  const [essai, setEssai] = useState(0);
  // React monte deux fois les effets en dev : sans ce garde, on paierait
  // deux générations.
  const lance = useRef(false);

  useEffect(() => {
    if (lance.current) return;
    lance.current = true;

    const rotation = setInterval(
      () => setEtape((n) => Math.min(n + 1, ETAPES.length - 1)),
      DUREE_ESTIMEE_MS / ETAPES.length,
    );

    fetch("/api/generate", { method: "POST" })
      .then(async (reponse) => {
        if (!reponse.ok) {
          const { erreur } = await reponse.json().catch(() => ({}));
          throw new Error(erreur ?? "La génération a échoué.");
        }
        router.replace("/dashboard");
      })
      .catch((e: Error) => setErreur(e.message))
      .finally(() => clearInterval(rotation));

    return () => clearInterval(rotation);
  }, [router, essai]);

  if (erreur) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-4 px-5 text-center">
        <h1 className="text-2xl font-semibold">Ça n&apos;a pas marché</h1>
        <p className="text-sm opacity-70">{erreur}</p>
        <button
          type="button"
          onClick={() => {
            lance.current = false;
            setErreur(null);
            setEtape(0);
            setEssai((n) => n + 1);
          }}
          className="rounded-lg bg-foreground px-4 py-3 font-medium text-background"
        >
          Réessayer
        </button>
      </main>
    );
  }

  const progression = ((etape + 1) / ETAPES.length) * 100;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-6 px-5 text-center">
      <div>
        <h1 className="text-2xl font-semibold">On te construit ton programme</h1>
        <p className="mt-2 text-sm opacity-70">
          Une trentaine de secondes. Ne ferme pas cette page.
        </p>
      </div>

      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/15"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progression)}
      >
        <div
          className="h-full rounded-full bg-foreground transition-[width] duration-1000 ease-out"
          style={{ width: `${progression}%` }}
        />
      </div>

      <p aria-live="polite" className="text-base font-medium">
        {ETAPES[etape]}
      </p>
    </main>
  );
}
