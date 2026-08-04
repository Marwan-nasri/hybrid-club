import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  type Programme,
  dureeEstimeeMin,
  jourActuel,
  prochaineSeance,
  seanceDuJour,
} from "@/lib/programme";

export const metadata = { title: "Aujourd'hui" };

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
    .limit(4);

  // On compare sur la date locale, pas sur completed_at brut : une séance
  // faite à 7h et une à 21h sont le même jour.
  const dateDuJour = new Date().toLocaleDateString("fr-FR");
  const dejaFaite = historique?.some(
    (log) =>
      log.session_key === aujourdhui?.key &&
      new Date(log.completed_at).toLocaleDateString("fr-FR") === dateDuJour,
  );

  const duree = aujourdhui ? dureeEstimeeMin(aujourdhui) : null;

  return (
    <main className="mx-auto w-full max-w-md px-5 pt-10">
      <div className="cascade flex flex-col gap-8">
        <p className="surtitre">{jourActuel()}</p>

        {aujourdhui ? (
          <section>
            <h1 className="text-6xl font-bold">{aujourdhui.name}</h1>

            <p className="surtitre mt-4">
              {aujourdhui.type === "muscu"
                ? `${aujourdhui.exercises.length} exercices`
                : `${aujourdhui.blocks.length} bloc${aujourdhui.blocks.length > 1 ? "s" : ""}`}
              {duree && ` · ≈ ${duree} min`}
            </p>

            {dejaFaite ? (
              <div className="carte mt-8 flex items-center gap-3 px-5 py-4">
                <span
                  aria-hidden
                  className="size-2 shrink-0 rounded-full bg-accent"
                />
                <p className="text-sm">
                  Séance validée aujourd&apos;hui. Repose-toi.
                </p>
              </div>
            ) : (
              <Link
                href={`/seance/${aujourdhui.key}`}
                className="bouton-accent mt-8 flex h-16 items-center justify-center text-xl"
              >
                Commencer
              </Link>
            )}
          </section>
        ) : (
          <section>
            <h1 className="text-6xl font-bold text-attenue">Repos</h1>
            {suivante && (
              <p className="surtitre mt-4">
                Prochaine séance {suivante.jour} · {suivante.seance.name}
              </p>
            )}
          </section>
        )}

        <section className="border-t border-bord pt-6">
          <h2 className="surtitre">Dernières séances</h2>

          {historique && historique.length > 0 ? (
            <ul className="mt-4 flex flex-col">
              {historique.map((log) => (
                <li
                  key={log.id}
                  className="flex items-baseline justify-between gap-4 border-b border-bord/60 py-3 last:border-0"
                >
                  <span className="truncate text-sm">
                    {programme.program_json.sessions.find(
                      (s) => s.key === log.session_key,
                    )?.name ?? log.session_key}
                  </span>
                  <span className="chiffres shrink-0 font-display text-sm uppercase tracking-wider text-attenue">
                    {new Date(log.completed_at).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            // Un écran vide qui n'explique rien est une occasion perdue.
            <p className="mt-4 text-sm text-attenue">
              Rien encore. Ta première séance validée apparaîtra ici.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
