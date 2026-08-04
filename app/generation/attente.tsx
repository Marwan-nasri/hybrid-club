"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// La génération prend 15 à 30s. On raconte ce qui se passe plutôt que de
// laisser tourner un spinner : le membre doit comprendre qu'on travaille.
const ETAPES = [
  "On lit ton profil",
  "On calcule ton cadre nutritionnel",
  "On construit tes séances",
  "On répartit ta semaine",
  "On choisit tes idées de repas",
  "On vérifie tout avant de te le montrer",
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
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-5">
        <div>
          <p className="surtitre">Échec</p>
          <h1 className="mt-3 text-5xl font-bold">Ça n&apos;a pas marché</h1>
          <p className="mt-3 text-sm text-attenue">{erreur}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            lance.current = false;
            setErreur(null);
            setEtape(0);
            setEssai((n) => n + 1);
          }}
          className="bouton-accent flex h-14 items-center justify-center text-lg"
        >
          Réessayer
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-10 px-5">
      <div>
        <p className="surtitre">Génération</p>
        <h1 className="mt-3 text-5xl font-bold">
          On construit
          <br />
          ton programme
        </h1>
        <p className="mt-3 text-sm text-attenue">
          Une trentaine de secondes. Ne ferme pas cette page.
        </p>
      </div>

      {/* Les étapes restent visibles : celles qui sont passées s'estompent au
          lieu de disparaître, pour montrer le chemin parcouru. */}
      <ol className="flex flex-col gap-3">
        {ETAPES.map((libelle, i) => {
          const faite = i < etape;
          const courante = i === etape;
          return (
            <li
              key={libelle}
              aria-current={courante ? "step" : undefined}
              className="flex items-center gap-3 transition-opacity duration-500"
              style={{ opacity: faite ? 0.35 : courante ? 1 : 0.15 }}
            >
              <span
                aria-hidden
                className="size-1.5 shrink-0 rounded-full transition-colors duration-500"
                style={{
                  backgroundColor: courante
                    ? "var(--color-accent)"
                    : "var(--color-attenue)",
                }}
              />
              <span
                className="font-display uppercase tracking-wider"
                style={{ fontSize: courante ? "1.25rem" : "1rem" }}
              >
                {libelle}
              </span>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
