"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ONGLETS = [
  { href: "/dashboard", libelle: "Aujourd'hui" },
  { href: "/programme", libelle: "Programme" },
  { href: "/nutrition", libelle: "Nutrition" },
  { href: "/compte", libelle: "Compte" },
];

export default function Nav() {
  const chemin = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-black/10 bg-white/95 backdrop-blur dark:border-white/15 dark:bg-black/95">
      <ul className="mx-auto flex max-w-sm">
        {ONGLETS.map((onglet) => {
          const actif = chemin === onglet.href;
          return (
            <li key={onglet.href} className="flex-1">
              <Link
                href={onglet.href}
                aria-current={actif ? "page" : undefined}
                className={`flex h-16 items-center justify-center text-sm ${
                  actif ? "font-semibold" : "font-medium opacity-50"
                }`}
              >
                {onglet.libelle}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
