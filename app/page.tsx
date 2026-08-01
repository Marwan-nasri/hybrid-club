import Link from "next/link";
import { deconnexion } from "./connexion/actions";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims.email;

  // Placeholder : la vraie landing, c'est l'étape 9. Ici on affiche juste de
  // quoi vérifier que l'onboarding a bien tourné.
  const { data: profil } = email
    ? await supabase
        .from("profiles")
        .select("member_number, onboarding_completed")
        .eq("id", data!.claims.sub)
        .maybeSingle()
    : { data: null };

  return (
    <div className="flex min-h-dvh flex-col bg-white font-sans dark:bg-black">
      <header className="flex w-full items-center justify-between gap-3 border-b border-black/10 px-5 py-3 text-sm dark:border-white/15">
        {email ? (
          <>
            <span className="min-w-0 truncate">
              Connecté en tant que{" "}
              <strong className="font-medium">{email}</strong>
            </span>
            <form action={deconnexion}>
              <button
                type="submit"
                className="shrink-0 rounded-lg border border-black/15 px-3 py-1.5 font-medium dark:border-white/20"
              >
                Se déconnecter
              </button>
            </form>
          </>
        ) : (
          <>
            <span>Tu n&apos;es pas connecté.</span>
            <Link href="/connexion" className="shrink-0 font-medium underline">
              Se connecter
            </Link>
          </>
        )}
      </header>

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 px-5 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Hybrid Club</h1>

        {!email ? (
          <p className="opacity-70">
            Connecte-toi pour rejoindre le club.
          </p>
        ) : profil?.onboarding_completed ? (
          <p className="text-lg">
            Bienvenue, membre n°
            <strong className="font-semibold">
              {profil.member_number ?? "—"}
            </strong>
            . Ton programme arrive.
          </p>
        ) : (
          <Link href="/onboarding" className="font-medium underline">
            Termine ton profil pour rejoindre le club
          </Link>
        )}
      </main>
    </div>
  );
}
