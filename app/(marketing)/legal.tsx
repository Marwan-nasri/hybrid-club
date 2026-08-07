/**
 * Gabarit commun aux trois pages légales. Elles ont la même structure et le
 * même rythme de lecture : un seul endroit pour la mise en page, sinon les
 * trois divergent à la première retouche.
 */
export function PageLegale({
  surtitre,
  titre,
  miseAJour,
  children,
}: {
  surtitre: string;
  titre: string;
  miseAJour: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-md px-5 py-14">
      <p className="surtitre">{surtitre}</p>
      <h1 className="mt-3 text-4xl">{titre}</h1>
      <p className="chiffres mt-3 text-xs text-gris">
        Dernière mise à jour : {miseAJour}
      </p>
      <div className="mt-10 flex flex-col gap-8">{children}</div>
    </main>
  );
}

export function Section({
  titre,
  children,
}: {
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-xl uppercase leading-tight">{titre}</h2>
      <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-gris">
        {children}
      </div>
    </section>
  );
}
