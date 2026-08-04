import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  type Programme,
  dureeEstimeeMin,
  joursDeLaSeance,
} from "@/lib/programme";

export const metadata = { title: "Programme" };

export default async function VueProgramme() {
  const supabase = await createClient();
  const { data: session } = await supabase.auth.getClaims();

  const { data: ligne } = await supabase
    .from("programs")
    .select("program_json, valid_until")
    .eq("user_id", session!.claims.sub)
    .eq("status", "active")
    .maybeSingle<{ program_json: Programme; valid_until: string | null }>();

  if (!ligne) redirect("/generation");
  const programme = ligne.program_json;

  return (
    <main className="mx-auto w-full max-w-md px-5 pt-10">
      <div className="cascade flex flex-col gap-10">
        <header>
          <p className="surtitre">Ton programme</p>
          <h1 className="mt-3 text-5xl font-bold">
            {programme.meta.days_per_week} séances
            <br />
            par semaine
          </h1>
          <p className="surtitre mt-4">
            Sur {programme.meta.weeks} semaines
            {ligne.valid_until &&
              ` · jusqu'au ${new Date(ligne.valid_until).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`}
          </p>
        </header>

        {programme.sessions.map((seance, i) => {
          const duree = dureeEstimeeMin(seance);
          return (
            <section key={seance.key} className="border-t border-bord pt-6">
              <div className="flex items-baseline gap-3">
                <span className="chiffres font-display text-2xl font-bold text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="text-3xl font-bold">{seance.name}</h2>
              </div>

              <p className="surtitre mt-2">
                {joursDeLaSeance(programme, seance.key).join(" · ")}
                {duree && ` · ≈ ${duree} min`}
              </p>

              <ul className="mt-5 flex flex-col gap-3">
                {seance.type === "muscu"
                  ? seance.exercises.map((exercice) => (
                      <li
                        key={exercice.name}
                        className="flex items-baseline justify-between gap-4"
                      >
                        <span className="text-sm">{exercice.name}</span>
                        <span className="chiffres shrink-0 font-display text-sm uppercase tracking-wider text-attenue">
                          {exercice.sets} × {exercice.reps}
                        </span>
                      </li>
                    ))
                  : seance.blocks.map((bloc) => (
                      <li key={bloc.format}>
                        <p className="font-display text-base uppercase tracking-wider">
                          {bloc.format}
                        </p>
                        <p className="mt-1 text-sm text-attenue">
                          {bloc.content}
                        </p>
                      </li>
                    ))}
              </ul>

              <Link
                href={`/seance/${seance.key}`}
                className="bouton-secondaire mt-6 flex h-12 items-center justify-center text-sm"
              >
                Ouvrir la séance
              </Link>
            </section>
          );
        })}
      </div>
    </main>
  );
}
