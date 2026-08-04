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
          {/* Les pages légales arrivent à l'étape 8. Un lien vers `#` serait
              un lien mort : on affiche les intitulés en attendant. */}
          <p className="text-xs text-gris">
            Mentions légales · Confidentialité — bientôt disponibles
          </p>
        </div>
      </footer>
    </div>
  );
}
