import Link from "next/link";
import { redirect } from "next/navigation";
import Renvoyer from "./renvoyer";

export const metadata = { title: "Confirme ton email" };

export default async function Verification({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  // Sans adresse, la page n'a rien à raconter ni à renvoyer.
  if (!email) redirect("/connexion?inscription=1");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-12">
      <div className="cascade flex flex-col">
        <p className="surtitre">Presque</p>
        <h1 className="mt-3 text-5xl">Confirme ton email</h1>

        <p className="mt-5 leading-relaxed text-gris">
          On vient d&apos;envoyer un lien à{" "}
          <span className="text-texte">{email}</span>. Clique dessus et ton
          compte est ouvert.
        </p>

        <div className="carte mt-8 p-5">
          <p className="surtitre">Rien reçu ?</p>
          <p className="mt-3 text-sm leading-relaxed text-gris">
            L&apos;email met parfois une minute. Pense à regarder tes spams : il
            arrive de <span className="text-texte">contact@hybridclub.fr</span>.
          </p>
          <Renvoyer email={email} />
        </div>

        <Link
          href="/connexion"
          className="surtitre mt-8 text-center transition-colors hover:text-texte"
        >
          Retour à la connexion
        </Link>
      </div>
    </main>
  );
}
