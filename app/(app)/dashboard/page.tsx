import Link from "next/link";
import { redirect } from "next/navigation";
import { exigerAbonnement } from "@/lib/abonnement";
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
  const userId = await exigerAbonnement();
  const supabase = await createClient();

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
            <h1 className="text-6xl">{aujourdhui.name}</h1>

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
                  className={`size-2 shrink-0 rounded-full ${
                    aujourdhui.type === "cardio" ? "bg-flux" : "bg-force"
                  }`}
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
            <h1 className="text-6xl text-gris">Repos</h1>
            {suivante && (
              <p className="surtitre mt-4">
                Prochaine séance {suivante.jour} · {suivante.seance.name}
              </p>
            )}
          </section>
        )}

        <section className="border-t border-ligne pt-6">
          <h2 className="surtitre">Dernières séances</h2>

          {historique && historique.length > 0 ? (
            <ul className="mt-4 flex flex-col">
              {historique.map((log) => (
                <li
                  key={log.id}
                  className="flex items-baseline justify-between gap-4 border-b border-ligne/60 py-3 last:border-0"
                >
                  <span className="truncate text-sm">
                    {programme.program_json.sessions.find(
                      (s) => s.key === log.session_key,
                    )?.name ?? log.session_key}
                  </span>
                  <span className="chiffres shrink-0 font-display text-sm uppercase tracking-wider text-gris">
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
            <p className="mt-4 text-sm text-gris">
              Rien encore. Ta première séance validée apparaîtra ici.
            </p>
          )}
        </section>

        {/* En bas : la séance du jour passe avant. Le bandeau s'efface tout
            seul une fois l'app installée — voir `.invite-installation`. */}
        <section className="invite-installation carte mt-6 p-5">
          <p className="surtitre">Sur ton écran d&apos;accueil</p>
          <p className="mt-3 text-sm leading-relaxed text-gris">
            Installe Hybrid Club sur ton téléphone : l&apos;app s&apos;ouvre
            directement sur ta séance du jour, sans passer par le navigateur.
          </p>
          <dl className="mt-4 flex flex-col gap-2 text-sm leading-relaxed">
            <div>
              <dt className="inline text-texte">iPhone —</dt>{" "}
              <dd className="inline text-gris">
                bouton Partager en bas de Safari, puis « Sur l&apos;écran
                d&apos;accueil ».
              </dd>
            </div>
            <div>
              <dt className="inline text-texte">Android —</dt>{" "}
              <dd className="inline text-gris">
                menu ⋮ de Chrome, puis « Installer l&apos;application ».
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </main>
  );
}
