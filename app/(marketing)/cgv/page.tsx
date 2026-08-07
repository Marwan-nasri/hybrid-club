import Link from "next/link";
import { JOURS_ESSAI, TARIFS } from "@/lib/tarifs";
import { PageLegale, Section } from "../legal";

export const metadata = {
  title: "Conditions générales de vente",
  description:
    "Formules, essai gratuit, reconduction, résiliation et droit de rétractation.",
};

/**
 * Médiateur de la consommation. L'adhésion à un organisme agréé est obligatoire
 * pour vendre à des particuliers, et ses coordonnées doivent figurer ici.
 *
 * À remplir dès l'adhésion signée — et pas avant : annoncer un médiateur
 * auquel on n'a pas adhéré serait pire que la formulation d'attente, puisqu'un
 * membre pourrait le saisir pour rien.
 */
const MEDIATEUR: { nom: string; adresse: string; site: string } | null = null;

export default function CGV() {
  return (
    <PageLegale
      surtitre="Hybrid Club"
      titre="Conditions générales de vente"
      miseAJour="7 août 2026"
    >
      <Section titre="Objet">
        <p>
          Ces conditions régissent l&apos;abonnement à Hybrid Club, édité par
          Marwan Nasri, entrepreneur individuel, 15 rue Gabriel Péri, 54500
          Vandœuvre-lès-Nancy (SIRET 989 473 830 00010). Elles sont acceptées au
          moment du paiement.
        </p>
      </Section>

      <Section titre="Ce que comprend l'abonnement">
        <p>
          Un programme d&apos;entraînement et un cadre nutritionnel générés à
          partir de ton profil, l&apos;accès à tes séances, la saisie et
          l&apos;historique de tes charges, et tes repères caloriques avec des
          idées de repas.
        </p>
        <p>
          Le service est fourni en l&apos;état, accessible en ligne. Une
          interruption temporaire pour maintenance ou du fait d&apos;un
          prestataire technique ne donne pas lieu à remboursement, sauf
          indisponibilité prolongée qui te serait imputable à tort.
        </p>
      </Section>

      <Section titre="Tarifs">
        <p>
          {TARIFS.map((t) => `${t.nom} : ${t.prix} ${t.periode}`).join(" · ")}.
        </p>
        <p>
          Prix en euros, TVA non applicable (article 293 B du CGI). Le tarif
          fondateur reste acquis tant que ton abonnement demeure actif et sans
          interruption.
        </p>
      </Section>

      <Section titre={`Essai gratuit de ${JOURS_ESSAI} jours`}>
        <p>
          Tout nouvel abonnement démarre par {JOURS_ESSAI} jours gratuits. Ta
          carte est enregistrée au moment de l&apos;inscription mais
          n&apos;est débitée d&apos;aucun montant pendant cette période.
        </p>
        <p>
          Si tu résilies avant la fin de l&apos;essai, aucun prélèvement
          n&apos;a lieu. Sinon, le premier paiement intervient automatiquement
          au terme des {JOURS_ESSAI} jours, au tarif de la formule choisie.
        </p>
      </Section>

      <Section titre="Reconduction et résiliation">
        <p>
          L&apos;abonnement se renouvelle automatiquement à chaque échéance,
          mensuelle ou annuelle selon ta formule, tant que tu ne le résilies
          pas.
        </p>
        <p>
          Tu peux résilier à tout moment depuis{" "}
          <Link
            href="/compte"
            className="text-texte underline underline-offset-2"
          >
            ton espace compte
          </Link>
          , en quelques clics et sans avoir à te justifier. La résiliation
          prend effet à la fin de la période déjà payée : tu conserves
          l&apos;accès jusque-là, et rien ne t&apos;est prélevé ensuite.
        </p>
      </Section>

      <Section titre="Droit de rétractation">
        <p>
          Tu disposes de quatorze jours à compter de la souscription pour te
          rétracter, sans motif et sans pénalité. Il te suffit de nous écrire à
          contact@hybridclub.fr, ou simplement de résilier depuis ton compte.
        </p>
        <p>
          Si un montant a déjà été prélevé, il te sera remboursé sous quatorze
          jours à compter de ta demande, sur le même moyen de paiement.
        </p>
      </Section>

      <Section titre="Paiement">
        <p>
          Les paiements sont traités par Stripe. Tes données bancaires sont
          saisies directement chez eux et ne transitent jamais par nos serveurs.
        </p>
        <p>
          En cas d&apos;échec de prélèvement, l&apos;accès est suspendu jusqu&apos;à
          régularisation. Stripe procède à plusieurs tentatives avant que
          l&apos;abonnement ne soit définitivement clos.
        </p>
      </Section>

      <Section titre="Ce que le service n'est pas">
        <p>
          Hybrid Club fournit des repères d&apos;entraînement et de nutrition
          calculés à partir des informations que tu renseignes. Ce ne sont ni
          des prescriptions médicales, ni un suivi diététique, ni un
          accompagnement personnalisé par un professionnel de santé.
        </p>
        <p>
          Aucun résultat chiffré n&apos;est promis : les progrès dépendent de
          trop de facteurs personnels pour être garantis. En cas de pathologie,
          de blessure, de grossesse, de trouble du comportement alimentaire ou
          de simple doute, consulte un professionnel de santé avant de
          commencer. Tu restes responsable de l&apos;exécution des exercices et
          de l&apos;adaptation des charges à tes capacités.
        </p>
      </Section>

      <Section titre="Compte et usage">
        <p>
          Ton compte est personnel. Le partage d&apos;identifiants, la revente
          ou la rediffusion des programmes générés peuvent entraîner la
          suspension de l&apos;accès, sans remboursement.
        </p>
        <p>Le service est réservé aux personnes majeures.</p>
      </Section>

      <Section titre="Médiation et litiges">
        <p>
          En cas de désaccord, écris-nous d&apos;abord à contact@hybridclub.fr :
          la plupart des situations se règlent directement.
        </p>
        {MEDIATEUR ? (
          <>
            <p>
              Si notre réponse ne te satisfait pas, tu peux saisir gratuitement
              notre médiateur de la consommation, dans un délai d&apos;un an à
              compter de ta réclamation écrite :
            </p>
            <p>
              {MEDIATEUR.nom}
              <br />
              {MEDIATEUR.adresse}
              <br />
              <a
                href={MEDIATEUR.site}
                className="text-texte underline underline-offset-2"
              >
                {MEDIATEUR.site.replace(/^https?:\/\//, "")}
              </a>
            </p>
          </>
        ) : (
          <p>
            Si notre réponse ne te satisfait pas, tu peux saisir gratuitement un
            médiateur de la consommation dans un délai d&apos;un an à compter de
            ta réclamation écrite. Ses coordonnées te seront communiquées sur
            simple demande à contact@hybridclub.fr.
          </p>
        )}
        <p>Ces conditions sont soumises au droit français.</p>
      </Section>
    </PageLegale>
  );
}
