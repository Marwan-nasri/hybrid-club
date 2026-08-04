import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  type Programme,
  prochaineSeance,
  seanceDuJour,
} from "@/lib/programme";

function Carte({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-black/10 p-5 dark:border-white/15">
      {children}
    </section>
  );
}

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: session } = await supabase.auth.getClaims();
  const userId = session!.claims.sub;

  const { data: programme } = await supabase
    .from("programs")
    .select("id, program_json")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle<{ id: string; program_json: Programme }>();

  if (!programme) redirect("/generation");

  const aujourdhui = seanceDuJour(programme.program_json);
  const suivante = prochaineSeance(programme.program_json);

  const { data: historique } = await supabase
    .from("workout_logs")
    .select("id, session_key, completed_at")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false })
    .limit(3);

  // Séance du jour déjà validée ? On compare sur la date locale, pas sur
  // completed_at brut : une séance faite à 7h et une à 21h sont le même jour.
  const dateDuJour = new Date().toLocaleDateString("fr-FR");
  const dejaFaite = historique?.some(
    (log) =>
      log.session_key === aujourdhui?.key &&
      new Date(log.completed_at).toLocaleDateString("fr-FR") === dateDuJour,
  );

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-5 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Aujourd&apos;hui</h1>

      {aujourdhui ? (
        <Carte>
          <p className="text-xs font-medium uppercase tracking-wide opacity-50">
            {aujourdhui.type === "cardio" ? "Cardio" : "Musculation"}
          </p>
          <h2 className="mt-1 text-xl font-semibold">{aujourdhui.name}</h2>
          <p className="mt-1 text-sm opacity-70">
            {aujourdhui.type === "muscu"
              ? `${aujourdhui.exercises.length} exercices`
              : `${aujourdhui.blocks.length} bloc${aujourdhui.blocks.length > 1 ? "s" : ""}`}
          </p>

          {dejaFaite ? (
            <p className="mt-5 rounded-lg bg-black/5 px-4 py-3 text-center text-sm font-medium dark:bg-white/10">
              Séance validée. Beau boulot.
            </p>
          ) : (
            <Link
              href={`/seance/${aujourdhui.key}`}
              className="mt-5 flex h-12 items-center justify-center rounded-lg bg-foreground font-medium text-background"
            >
              Commencer la séance
            </Link>
          )}
        </Carte>
      ) : (
        <Carte>
          <h2 className="text-xl font-semibold">Repos</h2>
          <p className="mt-1 text-sm opacity-70">
            {suivante
              ? `Prochaine séance ${suivante.jour} : ${suivante.seance.name}.`
              : "Rien de prévu cette semaine."}
          </p>
        </Carte>
      )}

      {historique && historique.length > 0 && (
        <section>
          <h2 className="text-sm font-medium uppercase tracking-wide opacity-50">
            Dernières séances
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {historique.map((log) => (
              <li
                key={log.id}
                className="flex items-baseline justify-between gap-3 text-sm"
              >
                <span className="truncate">
                  {programme.program_json.sessions.find(
                    (s) => s.key === log.session_key,
                  )?.name ?? log.session_key}
                </span>
                <span className="shrink-0 opacity-60">
                  {new Date(log.completed_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
