import { PageLegale, Section } from "../legal";

export const metadata = {
  title: "Mentions légales",
  description: "Éditeur, hébergeur et contact de Hybrid Club.",
};

export default function MentionsLegales() {
  return (
    <PageLegale
      surtitre="Hybrid Club"
      titre="Mentions légales"
      miseAJour="7 août 2026"
    >
      <Section titre="Éditeur du site">
        <p>
          Le site et l&apos;application Hybrid Club sont édités par Marwan
          Nasri, entrepreneur individuel.
        </p>
        <p>
          15 rue Gabriel Péri
          <br />
          54500 Vandœuvre-lès-Nancy
          <br />
          France
        </p>
        <p className="chiffres">SIRET : 989 473 830 00010</p>
        <p>
          Contact :{" "}
          <a
            href="mailto:contact@hybridclub.fr"
            className="text-texte underline underline-offset-2"
          >
            contact@hybridclub.fr
          </a>
        </p>
        <p>Directeur de la publication : Marwan Nasri.</p>
      </Section>

      <Section titre="TVA">
        <p>
          TVA non applicable, article 293 B du Code général des impôts. Les
          tarifs affichés sont donc des prix nets, sans TVA à ajouter.
        </p>
      </Section>

      <Section titre="Hébergement">
        <p>
          Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut,
          CA 91789, États-Unis. Les fonctions serveur sont exécutées depuis la
          région de Francfort (Allemagne).
        </p>
        <p>
          La base de données et le service d&apos;authentification sont fournis
          par Supabase Inc., avec des données stockées à Francfort (Allemagne).
        </p>
      </Section>

      <Section titre="Propriété intellectuelle">
        <p>
          La marque Hybrid Club, le site, l&apos;application, leurs textes et
          leur identité visuelle sont protégés. Les programmes
          d&apos;entraînement et cadres nutritionnels générés te sont destinés à
          titre personnel : tu peux les utiliser librement pour toi, mais pas
          les revendre ni les rediffuser.
        </p>
      </Section>

      <Section titre="Signaler un problème">
        <p>
          Pour tout contenu que tu jugerais inexact, dangereux ou inapproprié,
          écris à contact@hybridclub.fr. Une réponse te sera apportée dans les
          meilleurs délais.
        </p>
      </Section>
    </PageLegale>
  );
}
