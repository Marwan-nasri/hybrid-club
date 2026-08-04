import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims.email;

  // Placeholder : la vraie landing, c'est l'étape 9.
  const { data: profil } = email
    ? await supabase
        .from("profiles")
        .select("member_number, onboarding_completed")
        .eq("id", data!.claims.sub)
        .maybeSingle()
    : { data: null };

  const { data: programme } = profil?.onboarding_completed
    ? await supabase
        .from("programs")
        .select("id")
        .eq("user_id", data!.claims.sub)
        .eq("status", "active")
        .maybeSingle()
    : { data: null };

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-5 py-12">
      <div>
        <p className="surtitre">Hybrid Club</p>
        <h1 className="mt-3 text-6xl font-bold">
          Muscu
          <br />
          <span className="text-accent">+</span> cardio
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-attenue">
          Ton programme et ton cadre nutritionnel, construits sur ton profil.
        </p>
      </div>

      {!email ? (
        <Link
          href="/connexion"
          className="bouton-accent flex h-14 items-center justify-center text-lg"
        >
          Rejoindre le club
        </Link>
      ) : profil?.onboarding_completed ? (
        <div className="flex flex-col gap-3">
          <p className="surtitre">Membre n°{profil.member_number ?? "—"}</p>
          <Link
            href={programme ? "/dashboard" : "/generation"}
            className="bouton-accent flex h-14 items-center justify-center text-lg"
          >
            {programme ? "Ma séance du jour" : "Générer mon programme"}
          </Link>
        </div>
      ) : (
        <Link
          href="/onboarding"
          className="bouton-accent flex h-14 items-center justify-center text-lg"
        >
          Compléter mon profil
        </Link>
      )}
    </main>
  );
}
