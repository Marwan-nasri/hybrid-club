import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type Programme, joursDeLaSeance } from "@/lib/programme";

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
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-5 py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Ton programme</h1>
        <p className="mt-1 text-sm opacity-70">
          {programme.meta.weeks} semaines · {programme.meta.days_per_week}{" "}
          séances par semaine
        </p>
      </header>

      {programme.sessions.map((seance) => (
        <section
          key={seance.key}
          className="rounded-2xl border border-black/10 p-5 dark:border-white/15"
        >
          <p className="text-xs font-medium uppercase tracking-wide opacity-50">
            {joursDeLaSeance(programme, seance.key).join(" · ")}
          </p>
          <h2 className="mt-1 text-lg font-semibold">{seance.name}</h2>

          <ul className="mt-4 flex flex-col gap-3 text-sm">
            {seance.type === "muscu"
              ? seance.exercises.map((exercice) => (
                  <li key={exercice.name}>
                    <p className="font-medium">{exercice.name}</p>
                    <p className="opacity-70">
                      {exercice.sets} × {exercice.reps} · repos{" "}
                      {exercice.rest_sec}s
                    </p>
                  </li>
                ))
              : seance.blocks.map((bloc) => (
                  <li key={bloc.format}>
                    <p className="font-medium">{bloc.format}</p>
                    <p className="opacity-70">{bloc.content}</p>
                  </li>
                ))}
          </ul>

          <Link
            href={`/seance/${seance.key}`}
            className="mt-5 flex h-11 items-center justify-center rounded-lg border border-black/15 text-sm font-medium dark:border-white/20"
          >
            Ouvrir la séance
          </Link>
        </section>
      ))}
    </main>
  );
}
