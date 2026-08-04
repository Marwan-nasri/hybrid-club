import { createClient } from "@/lib/supabase/server";
import { deconnexion } from "@/app/connexion/actions";
import Suppression from "./suppression";

export default async function Compte() {
  const supabase = await createClient();
  const { data: session } = await supabase.auth.getClaims();

  const { data: profil } = await supabase
    .from("profiles")
    .select("member_number, created_at")
    .eq("id", session!.claims.sub)
    .maybeSingle();

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-8 px-5 py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Ton compte</h1>
        <p className="mt-1 text-sm opacity-70">
          Membre n°{profil?.member_number ?? "—"} ·{" "}
          {session?.claims.email as string}
        </p>
      </header>

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wide opacity-50">
          Tes données
        </h2>
        <p className="mt-2 text-sm opacity-80">
          Tu peux récupérer à tout moment l&apos;intégralité de ce qu&apos;on
          stocke sur toi, dans un fichier JSON.
        </p>
        {/* Un lien et non un bouton : le navigateur télécharge directement,
            sans passer par du JavaScript. */}
        <a
          href="/api/compte/export"
          download
          className="mt-3 flex h-12 items-center justify-center rounded-lg border border-black/15 font-medium dark:border-white/20"
        >
          Exporter mes données
        </a>
      </section>

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wide opacity-50">
          Session
        </h2>
        <form action={deconnexion} className="mt-3">
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center rounded-lg border border-black/15 font-medium dark:border-white/20"
          >
            Se déconnecter
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wide opacity-50">
          Zone sensible
        </h2>
        <div className="mt-3">
          <Suppression />
        </div>
      </section>
    </main>
  );
}
