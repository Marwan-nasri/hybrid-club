"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ONGLETS = [
  { href: "/dashboard", libelle: "Jour" },
  { href: "/programme", libelle: "Programme" },
  { href: "/nutrition", libelle: "Nutrition" },
  { href: "/compte", libelle: "Compte" },
];

export default function Nav() {
  const chemin = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ligne bg-noir/90 backdrop-blur-md">
      <ul className="mx-auto flex max-w-md">
        {ONGLETS.map((onglet) => {
          const actif = chemin === onglet.href;
          return (
            <li key={onglet.href} className="flex-1">
              <Link
                href={onglet.href}
                aria-current={actif ? "page" : undefined}
                className="relative flex h-[4.5rem] items-center justify-center font-display text-sm uppercase tracking-widest transition-colors"
                style={{
                  color: actif
                    ? "var(--color-texte)"
                    : "var(--color-gris)",
                }}
              >
                {/* Trait plein plutôt qu'une simple nuance de gris : l'onglet
                    actif doit se repérer d'un coup d'œil, bras tendu. */}
                {actif && (
                  <span
                    aria-hidden
                    className="degrade absolute inset-x-5 top-0 h-0.5"
                  />
                )}
                {onglet.libelle}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
