import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JOURS_ESSAI, TARIFS } from "@/lib/tarifs";
import { souscrire } from "./actions";

export const metadata = { title: "Rejoindre le club" };

export default async function PageAbonnement() {
  const supabase = await createClient();
  const { data: session } = await supabase.auth.getClaims();

  const { data: abonnement } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", session!.claims.sub)
    .maybeSingle<{ status: string }>();

  // Déjà membre : cette page n'a rien à lui vendre, et la gestion de son
  // abonnement se fait depuis /compte.
  if (abonnement && ["active", "trialing"].includes(abonnement.status)) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto w-full max-w-md px-5 py-12">
      <div className="cascade flex flex-col">
        <p className="surtitre">Dernière étape</p>
        <h1 className="mt-3 text-5xl">
          {JOURS_ESSAI} jours
          <br />
          offerts
        </h1>
        <p className="mt-4 leading-relaxed text-gris">
          Ton programme est généré et il est à toi. Essaie-le {JOURS_ESSAI}{" "}
          jours sans payer : tes séances, tes charges, ta nutrition. Tu
          n&apos;es prélevé qu&apos;au {JOURS_ESSAI + 1}
          <sup>e</sup> jour, et tu peux arrêter avant en deux clics.
        </p>

        <div className="mt-8 flex flex-col gap-4">
          {TARIFS.map((tarif) => (
            <form
              action={souscrire}
              key={tarif.plan}
              className="rounded-2xl border p-6"
              style={{
                borderColor: tarif.fondateur
                  ? "var(--color-or)"
                  : "var(--color-ligne)",
                backgroundColor: tarif.fondateur
                  ? "color-mix(in srgb, var(--color-or) 6%, transparent)"
                  : "var(--color-carbone)",
              }}
            >
              <input type="hidden" name="plan" value={tarif.plan} />

              <div className="flex items-baseline justify-between gap-3">
                <h2
                  className="font-display text-xl uppercase"
                  style={{
                    color: tarif.fondateur ? "var(--color-or)" : undefined,
                  }}
                >
                  {tarif.nom}
                </h2>
                {tarif.fondateur && (
                  <span
                    className="chiffres text-[0.625rem] uppercase tracking-widest"
                    style={{ color: "var(--color-or)" }}
                  >
                    Lancement
                  </span>
                )}
              </div>

              <p className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-5xl leading-none">
                  {tarif.prix}
                </span>
                <span className="surtitre">{tarif.periode}</span>
              </p>

              {/* Le prix qui suit l'essai doit être lisible avant de payer,
                  pas seulement sur le reçu. */}
              <p className="chiffres mt-2 text-xs text-gris">
                {JOURS_ESSAI} jours offerts, puis {tarif.prix} {tarif.periode}
              </p>

              <p className="mt-3 text-sm leading-relaxed text-gris">
                {tarif.argument}
              </p>

              {/* Le dégradé est réservé à une seule action par écran : ici les
                  trois formules se valent, aucune ne le porte. */}
              <button
                type="submit"
                className="bouton-secondaire mt-5 flex h-14 w-full items-center justify-center text-base"
                style={
                  tarif.fondateur
                    ? { borderColor: "var(--color-or)", color: "var(--color-or)" }
                    : undefined
                }
              >
                Commencer l&apos;essai
              </button>
            </form>
          ))}
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-gris">
          Ta carte est enregistrée maintenant mais n&apos;est débitée
          qu&apos;au bout de {JOURS_ESSAI} jours. Paiement sécurisé par Stripe,
          résiliable à tout moment depuis ton compte — si tu arrêtes pendant
          l&apos;essai, tu n&apos;es pas prélevé du tout.
        </p>
      </div>
    </main>
  );
}
