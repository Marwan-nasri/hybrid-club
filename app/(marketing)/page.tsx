import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { JOURS_ESSAI, TARIFS } from "@/lib/tarifs";

export const metadata = {
  // `absolute` court-circuite le gabarit « %s · Hybrid Club » du layout
  // racine, qui doublerait le nom de la marque sur la page d'accueil.
  title: { absolute: "Hybrid Club — ton programme muscu + cardio" },
  description:
    "Un programme d'entraînement hybride et un cadre nutritionnel construits sur ton profil, pas copiés sur quelqu'un d'autre.",
};

const ETAPES = [
  {
    titre: "Tu réponds à quelques questions",
    detail:
      "Ton objectif, ton niveau, le matériel dont tu disposes, tes jours dispos, ce que tu ne manges pas.",
  },
  {
    titre: "On construit ton programme",
    detail:
      "Tes séances et ton cadre nutritionnel sont générés à partir de ces réponses. Ça prend une trentaine de secondes.",
  },
  {
    titre: "Tu t'entraînes et tu notes tes charges",
    detail:
      "Chaque séance s'ouvre sur ton téléphone. Tu saisis tes séries, et tu retrouves tes charges de la fois précédente.",
  },
];

const CONTENU = [
  {
    titre: "Un programme hybride",
    detail:
      "Muscu et cardio sur 5 semaines, réparti sur tes jours disponibles. Chaque exercice avec ses séries, ses répétitions, son temps de repos et sa règle de progression.",
  },
  {
    titre: "Adapté à ton matériel",
    detail:
      "Salle complète, une paire d'haltères à la maison ou rien du tout : le programme ne te propose que ce que tu peux réellement faire.",
  },
  {
    titre: "Un cadre nutritionnel calculé",
    detail:
      "Tes calories et tes macros sont calculées par formule, pas devinées. Avec des idées de repas qui respectent ton régime et évitent ce que tu n'aimes pas.",
  },
  {
    titre: "Le suivi de tes charges",
    detail:
      "Ton historique de séances, et tes charges précédentes affichées au moment de la saisie pour savoir où tu en es.",
  },
  {
    titre: "Sur ton écran d'accueil",
    detail:
      "L'app s'installe sur ton téléphone et s'ouvre directement sur la séance du jour.",
  },
];

const FAQ = [
  {
    question: "Il me faut une salle de sport ?",
    reponse:
      "Non. Tu indiques ton matériel à l'inscription : salle complète, haltères à la maison, ou rien. Le programme est construit avec ce que tu as, et il n'y aura aucun exercice que tu ne peux pas faire.",
  },
  {
    question: "Ça marche vraiment au poids du corps ?",
    reponse:
      "Oui. Les séances utilisent alors des variantes et des progressions au poids du corps, avec le mobilier que tout le monde a chez soi — une chaise, une table. Le cardio se fait sans matériel.",
  },
  {
    question: "C'est un régime ?",
    reponse:
      "Non. Tu reçois un cadre : des calories, des macros, et des idées de repas pour t'en approcher. Rien n'est interdit, il n'y a pas de menu imposé, et tu choisis parmi plusieurs options à chaque repas.",
  },
  {
    question: "Comment marche l'essai gratuit ?",
    reponse:
      "Tu enregistres ta carte pour démarrer, mais rien n'est débité pendant les sept premiers jours. Si tu arrêtes avant la fin de l'essai, tu ne paies rien du tout. Sinon, le premier prélèvement se fait au huitième jour, au tarif de la formule choisie.",
  },
  {
    question: "Je peux annuler ?",
    reponse:
      "Oui, à tout moment et depuis ton compte. Tu gardes l'accès jusqu'à la fin de la période déjà payée.",
  },
  {
    question: "Mes données sont stockées où ?",
    reponse:
      "En Europe, à Francfort. Tu peux exporter l'intégralité de tes données en un fichier, ou supprimer ton compte et tout ce qui va avec, depuis ton espace membre.",
  },
];

export default async function Landing() {
  const supabase = await createClient();
  const { data: session } = await supabase.auth.getClaims();
  const userId = session?.claims.sub;

  const { data: profil } = userId
    ? await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", userId)
        .maybeSingle()
    : { data: null };

  const { data: programme } = profil?.onboarding_completed
    ? await supabase
        .from("programs")
        .select("id")
        .eq("user_id", userId!)
        .eq("status", "active")
        .maybeSingle()
    : { data: null };

  // Le bouton principal suit l'état du visiteur : envoyer un membre déjà
  // inscrit vers l'inscription serait absurde.
  const action = !userId
    ? { href: "/connexion?inscription=1", libelle: "Rejoindre le club" }
    : !profil?.onboarding_completed
      ? { href: "/onboarding", libelle: "Compléter mon profil" }
      : programme
        ? { href: "/dashboard", libelle: "Ma séance du jour" }
        : { href: "/generation", libelle: "Générer mon programme" };

  return (
    <main className="mx-auto w-full max-w-md px-5">
      {/* ---------------------------------------------------- Accroche --- */}
      <section className="cascade flex flex-col py-16">
        <p className="surtitre">Hybrid Club</p>
        <h1 className="mt-4 text-6xl">
          Ton programme,
          <br />
          pas celui
          <br />
          <span className="text-force">d&apos;un</span>{" "}
          <span className="text-flux">autre</span>
        </h1>
        <p className="mt-5 leading-relaxed text-gris">
          Un programme muscu + cardio et un cadre nutritionnel construits à
          partir de ton profil : ton objectif, ton niveau, ton matériel, tes
          jours disponibles.
        </p>

        <Link
          href={action.href}
          className="bouton-accent mt-8 flex h-16 items-center justify-center text-xl"
        >
          {action.libelle}
        </Link>
        <a
          href="#tarifs"
          className="surtitre mt-5 text-center transition-colors hover:text-texte"
        >
          Voir les tarifs
        </a>
      </section>

      {/* ----------------------------------------------------- Problème --- */}
      <section className="border-t border-ligne py-14">
        <p className="surtitre">Le problème</p>
        <h2 className="mt-4 text-4xl">
          Un programme trouvé en ligne n&apos;a pas été écrit pour toi
        </h2>
        <ul className="mt-6 flex flex-col gap-4 text-gris">
          <li>
            Il suppose un matériel que tu n&apos;as pas, ou un niveau qui
            n&apos;est pas le tien.
          </li>
          <li>
            Il ne dit pas quoi faire le jour où tu arrives à la salle sans
            savoir par où commencer.
          </li>
          <li>
            Et côté alimentation, tu navigues à vue entre des conseils
            contradictoires.
          </li>
        </ul>
      </section>

      {/* ------------------------------------------------ Comment ça marche --- */}
      <section className="border-t border-ligne py-14">
        <p className="surtitre">Comment ça marche</p>
        <ol className="mt-6 flex flex-col gap-8">
          {ETAPES.map((etape, i) => (
            <li key={etape.titre}>
              <span className="chiffres text-sm text-gris">
                0{i + 1}
              </span>
              <h3 className="mt-1 font-display text-2xl uppercase leading-tight">
                {etape.titre}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gris">
                {etape.detail}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------ Ce que tu reçois --- */}
      <section className="border-t border-ligne py-14">
        <p className="surtitre">Ce que tu reçois</p>
        <div className="mt-6 flex flex-col gap-4">
          {CONTENU.map((bloc) => (
            <div key={bloc.titre} className="carte p-5">
              <h3 className="font-display text-xl uppercase">{bloc.titre}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gris">
                {bloc.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- Tarifs --- */}
      <section id="tarifs" className="scroll-mt-6 border-t border-ligne py-14">
        <p className="surtitre">Tarifs</p>
        <h2 className="mt-4 text-4xl">Rejoindre le club</h2>

        <div className="mt-8 flex flex-col gap-4">
          {TARIFS.map((tarif) => (
            <div
              key={tarif.nom}
              className="rounded-2xl border p-6"
              style={{
                // L'or est réservé par la palette à l'offre fondateur.
                borderColor: tarif.fondateur
                  ? "var(--color-or)"
                  : "var(--color-ligne)",
                backgroundColor: tarif.fondateur
                  ? "color-mix(in srgb, var(--color-or) 6%, transparent)"
                  : "var(--color-carbone)",
              }}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3
                  className="font-display text-xl uppercase"
                  style={{
                    color: tarif.fondateur ? "var(--color-or)" : undefined,
                  }}
                >
                  {tarif.nom}
                </h3>
                {tarif.fondateur && (
                  <span
                    className="chiffres text-[0.625rem] uppercase tracking-widest"
                    style={{ color: "var(--color-or)" }}
                  >
                    Lancement
                  </span>
                )}
              </div>

              {/* Anton et non Space Mono : en chasse fixe, la virgule et
                  l'espace occupent une cellule pleine et « 9,99 € » se lit
                  « 9 , 99  € ». */}
              <p className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-5xl leading-none">
                  {tarif.prix}
                </span>
                <span className="surtitre">{tarif.periode}</span>
              </p>

              <p className="chiffres mt-2 text-xs text-gris">
                {JOURS_ESSAI} jours offerts, puis {tarif.prix} {tarif.periode}
              </p>

              <p className="mt-3 text-sm leading-relaxed text-gris">
                {tarif.argument}
              </p>
            </div>
          ))}
        </div>

        <Link
          href={action.href}
          className="bouton-accent mt-8 flex h-16 items-center justify-center text-xl"
        >
          {action.libelle}
        </Link>
        <p className="mt-4 text-center text-xs leading-relaxed text-gris">
          Tu crées ton compte et tu construis ton programme d&apos;abord.
          Ensuite, {JOURS_ESSAI} jours d&apos;essai : ta carte n&apos;est
          débitée qu&apos;au terme, et pas du tout si tu arrêtes avant.
        </p>
      </section>

      {/* ----------------------------------------------------------- FAQ --- */}
      <section className="border-t border-ligne py-14">
        <p className="surtitre">Questions fréquentes</p>
        <div className="mt-6 flex flex-col">
          {FAQ.map((item) => (
            // <details> natif : aucun JavaScript, et accessible par défaut.
            <details
              key={item.question}
              className="group border-b border-ligne py-4"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-display text-lg uppercase leading-tight marker:content-['']">
                {item.question}
                <span
                  aria-hidden
                  className="shrink-0 text-gris transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-gris">
                {item.reponse}
              </p>
            </details>
          ))}
        </div>

        {/* La page vend un cadre nutritionnel : le disclaimer suit. */}
        <p className="mt-8 text-xs leading-relaxed text-gris">
          Hybrid Club fournit des repères d&apos;entraînement et de nutrition
          calculés à partir de ton profil. Ce ne sont pas des prescriptions
          médicales ni diététiques. En cas de pathologie, de trouble du
          comportement alimentaire ou de doute, parles-en à un professionnel de
          santé.
        </p>
      </section>
    </main>
  );
}
