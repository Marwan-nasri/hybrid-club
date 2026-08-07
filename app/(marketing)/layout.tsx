import Link from "next/link";

export default function LayoutMarketing({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex-1">{children}</div>

      <footer className="border-t border-ligne px-5 py-8">
        <div className="mx-auto flex w-full max-w-md flex-col gap-4">
          <p className="surtitre">Hybrid Club</p>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gris">
            {[
              { href: "/mentions-legales", libelle: "Mentions légales" },
              { href: "/confidentialite", libelle: "Confidentialité" },
              { href: "/cgv", libelle: "CGV" },
            ].map((lien) => (
              <Link
                key={lien.href}
                href={lien.href}
                className="transition-colors hover:text-texte"
              >
                {lien.libelle}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
