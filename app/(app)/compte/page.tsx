import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deconnexion } from "@/app/connexion/actions";
import { ouvrirPortail } from "../abonnement/actions";
import Suppression from "./suppression";

export default async function Compte() {
  const supabase = await createClient();
  const { data: session } = await supabase.auth.getClaims();

  const [{ data: profil }, { data: abonnement }] = await Promise.all([
    supabase
      .from("profiles")
      .select("member_number, created_at")
      .eq("id", session!.claims.sub)
      .maybeSingle(),
    supabase
      .from("subscriptions")
      .select("plan, status, current_period_end")
      .eq("user_id", session!.claims.sub)
      .maybeSingle<{
        plan: string | null;
        status: string;
        current_period_end: string | null;
      }>(),
  ]);

  const actif =
    !!abonnement && ["active", "trialing"].includes(abonnement.status);

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-10 px-5 pt-10">
      <header>
        <h1 className="text-5xl">Ton compte</h1>
        <p className="surtitre mt-3">
          Membre n°{profil?.member_number ?? "—"} ·{" "}
          {session?.claims.email as string}
        </p>
      </header>

      <section>
        <h2 className="surtitre">Abonnement</h2>
        {actif ? (
          <>
            <p className="mt-3 text-sm text-gris">
              Formule {abonnement.plan ?? "en cours"}
              {abonnement.current_period_end &&
                ` · prochaine échéance le ${new Date(
                  abonnement.current_period_end,
                ).toLocaleDateString("fr-FR")}`}
              .
            </p>
            {/* Moyen de paiement, changement de formule et résiliation : tout
                passe par le portail Stripe, qu'on n'a pas à réimplémenter. */}
            <form action={ouvrirPortail} className="mt-4">
              <button
                type="submit"
                className="bouton-secondaire flex h-14 w-full items-center justify-center text-base"
              >
                Gérer mon abonnement
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm text-gris">
              Tu n&apos;as pas d&apos;abonnement en cours.
            </p>
            <Link
              href="/abonnement"
              className="bouton-secondaire mt-4 flex h-14 items-center justify-center text-base"
            >
              Voir les formules
            </Link>
          </>
        )}
      </section>

      <section>
        <h2 className="surtitre">
          Tes données
        </h2>
        <p className="mt-3 text-sm text-gris">
          Tu peux récupérer à tout moment l&apos;intégralité de ce qu&apos;on
          stocke sur toi, dans un fichier JSON.
        </p>
        {/* Un lien et non un bouton : le navigateur télécharge directement,
            sans passer par du JavaScript. */}
        <a
          href="/api/compte/export"
          download
          className="bouton-secondaire mt-4 flex h-14 items-center justify-center text-base"
        >
          Exporter mes données
        </a>
      </section>

      <section>
        <h2 className="surtitre">
          Session
        </h2>
        <form action={deconnexion} className="mt-3">
          <button
            type="submit"
            className="bouton-secondaire flex h-14 w-full items-center justify-center text-base"
          >
            Se déconnecter
          </button>
        </form>
      </section>

      <section className="border-t border-ligne pt-6">
        <h2 className="surtitre">
          Zone sensible
        </h2>
        <div className="mt-3">
          <Suppression />
        </div>
      </section>
    </main>
  );
}
