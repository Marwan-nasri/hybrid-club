import Link from "next/link";
import { PageLegale, Section } from "../legal";

export const metadata = {
  title: "Confidentialité",
  description:
    "Quelles données Hybrid Club collecte, pourquoi, où elles sont stockées et comment les récupérer ou les supprimer.",
};

export default function Confidentialite() {
  return (
    <PageLegale
      surtitre="Hybrid Club"
      titre="Politique de confidentialité"
      miseAJour="7 août 2026"
    >
      <Section titre="Qui est responsable de tes données">
        <p>
          Marwan Nasri, entrepreneur individuel, 15 rue Gabriel Péri, 54500
          Vandœuvre-lès-Nancy — contact@hybridclub.fr.
        </p>
      </Section>

      <Section titre="Ce qu'on collecte">
        <p>
          <strong className="text-texte">Ton compte</strong> : ton adresse
          email et ton mot de passe (chiffré, jamais lisible par nous).
        </p>
        <p>
          <strong className="text-texte">Ton profil</strong> : sexe, année de
          naissance, taille, poids, objectif, niveau, matériel disponible,
          nombre de jours d&apos;entraînement, régime alimentaire et aliments
          que tu ne veux pas voir apparaître.
        </p>
        <p>
          <strong className="text-texte">Ton activité</strong> : les séances
          que tu valides et les charges que tu saisis.
        </p>
        <p>
          <strong className="text-texte">Ton abonnement</strong> : ton statut,
          ta formule et l&apos;échéance en cours. Ta carte bancaire n&apos;est
          jamais reçue ni stockée par nous : elle est saisie directement chez
          Stripe.
        </p>
        <p>
          On ne te demande aucune donnée médicale, aucun diagnostic, aucun
          traitement — et on n&apos;en veut pas. Ta taille et ton poids servent
          uniquement au calcul de tes besoins caloriques, jamais à une
          appréciation de ton état de santé.
        </p>
      </Section>

      <Section titre="Pourquoi, et sur quelle base">
        <p>
          Tes données de profil servent à générer ton programme et ton cadre
          nutritionnel, et à te les afficher. Sans elles, le service ne peut pas
          fonctionner : la base légale est l&apos;exécution du contrat qui nous
          lie, complétée par ton consentement explicite recueilli à
          l&apos;inscription.
        </p>
        <p>
          Ton email sert aussi à t&apos;envoyer les messages nécessaires au
          service : confirmation de compte, réinitialisation de mot de passe,
          information sur ton abonnement.
        </p>
      </Section>

      <Section titre="Où elles sont stockées">
        <p>
          Dans l&apos;Union européenne, à Francfort (Allemagne), chez Supabase.
          Les fonctions serveur qui les manipulent s&apos;exécutent également
          depuis Francfort.
        </p>
      </Section>

      <Section titre="Qui d'autre y a accès">
        <p>
          Uniquement les prestataires nécessaires au fonctionnement du service,
          chacun pour sa part :
        </p>
        <p>
          <strong className="text-texte">Supabase</strong> — base de données et
          comptes (UE, Francfort).
          <br />
          <strong className="text-texte">Vercel</strong> — hébergement du site.
          <br />
          <strong className="text-texte">Anthropic</strong> — génération des
          programmes. Ton profil lui est transmis sans ton email ni ton nom, et
          n&apos;est pas utilisé pour entraîner ses modèles.
          <br />
          <strong className="text-texte">Stripe</strong> — paiement et gestion
          de l&apos;abonnement.
          <br />
          <strong className="text-texte">Resend</strong> — envoi des emails
          (UE, Irlande).
        </p>
        <p>
          Certains de ces prestataires sont établis aux États-Unis. Les
          transferts sont alors encadrés par les clauses contractuelles types de
          la Commission européenne. Tes données ne sont jamais vendues, ni
          cédées, ni utilisées à des fins publicitaires.
        </p>
      </Section>

      <Section titre="Combien de temps">
        <p>
          Tant que ton compte existe. Si tu le supprimes, tout est effacé
          immédiatement et définitivement : profil, programmes, historique de
          séances, abonnement. Seules les données que Stripe doit conserver au
          titre de ses obligations comptables restent chez lui, pendant la durée
          légale.
        </p>
      </Section>

      <Section titre="Cookies">
        <p>
          Uniquement des cookies techniques, ceux qui te gardent connecté. Pas
          de cookie publicitaire, pas de traceur tiers, pas de Google Analytics.
          C&apos;est pour cette raison qu&apos;aucune bannière de consentement
          ne t&apos;est imposée : il n&apos;y a rien à accepter.
        </p>
      </Section>

      <Section titre="Tes droits">
        <p>
          Tu peux accéder à tes données, les corriger, les récupérer ou les
          effacer. Les deux principaux sont directement à ta main, sans avoir à
          nous écrire, depuis{" "}
          <Link
            href="/compte"
            className="text-texte underline underline-offset-2"
          >
            ton espace compte
          </Link>{" "}
          : exporter l&apos;intégralité de tes données en un fichier, et
          supprimer ton compte.
        </p>
        <p>
          Pour les autres demandes — rectification, opposition, limitation —
          écris à contact@hybridclub.fr. Réponse sous un mois au maximum.
        </p>
        <p>
          Si une réponse ne te convient pas, tu peux saisir la CNIL : 3 place de
          Fontenoy, 75007 Paris, ou sur cnil.fr.
        </p>
      </Section>
    </PageLegale>
  );
}
