import "server-only";

/**
 * Emails transactionnels, envoyés par l'API Resend en HTTP direct : c'est un
 * POST JSON, le SDK n'apporterait rien qu'une dépendance de plus.
 *
 * Règle de ce fichier : un email qui échoue ne fait jamais échouer l'action qui
 * l'a déclenché. Perdre un email de bienvenue est un désagrément ; perdre un
 * programme généré parce que l'envoi a planté serait une faute.
 */

const EXPEDITEUR = "Hybrid Club <contact@hybridclub.fr>";

async function envoyer(destinataire: string, sujet: string, html: string) {
  const cle = process.env.RESEND_API_KEY;
  // Environnement sans clé (build, développement) : on ne tente rien et on ne
  // se plaint pas.
  if (!cle) return;

  try {
    const reponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cle}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EXPEDITEUR,
        to: [destinataire],
        subject: sujet,
        html,
      }),
    });
    if (!reponse.ok) {
      console.error("[email]", sujet, reponse.status, await reponse.text());
    }
  } catch (erreur) {
    console.error("[email] envoi impossible", sujet, erreur);
  }
}

/**
 * Gabarit commun, aligné sur `docs/emails/confirmation.html`. Les contraintes
 * du HTML d'email valent ici aussi : tableaux plutôt que flex pour Outlook,
 * styles en ligne pour Gmail, aucune webfont — Anton ne se charge pas dans les
 * clients mail, le display est rappelé par une capitale espacée.
 */
function gabarit({
  apercu,
  surtitre,
  titre,
  corps,
  bouton,
  pied,
}: {
  apercu: string;
  surtitre: string;
  titre: string;
  corps: string;
  bouton: { libelle: string; href: string };
  pied: string;
}) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0b0d11;margin:0;padding:0;">
  <tr><td align="center" style="padding:32px 16px;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${apercu}</div>
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#14171e;border:1px solid #232833;border-radius:16px;">
      <tr><td style="padding:40px 32px;">
        <p style="margin:0;font-family:'Courier New',monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#9ba1ae;">${surtitre}</p>
        <h1 style="margin:14px 0 0;font-family:'Arial Narrow',Arial,sans-serif;font-size:34px;line-height:1.05;letter-spacing:0.5px;text-transform:uppercase;color:#f2f1ec;font-weight:700;">${titre}</h1>
        <div style="margin:20px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#9ba1ae;">${corps}</div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:32px 0 0;">
          <tr><td align="center" bgcolor="#ff4b2b" style="background-color:#ff4b2b;background-image:linear-gradient(90deg,#ff4b2b,#5b7cff);border-radius:12px;">
            <a href="${bouton.href}" style="display:block;padding:17px 36px;font-family:'Arial Narrow',Arial,sans-serif;font-size:17px;letter-spacing:1px;text-transform:uppercase;font-weight:700;color:#ffffff;text-decoration:none;">${bouton.libelle}</a>
          </td></tr>
        </table>
        <div style="margin:32px 0 0;border-top:1px solid #232833;"></div>
        <p style="margin:20px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#9ba1ae;">${pied}</p>
      </td></tr>
    </table>
    <p style="margin:20px 0 0;font-family:'Courier New',monospace;font-size:11px;letter-spacing:1px;color:#9ba1ae;">HYBRID CLUB · hybridclub.fr</p>
  </td></tr>
</table>`;
}

const SITE = "https://www.hybridclub.fr";

/** Envoyé une fois l'onboarding terminé, quand le numéro de membre est attribué. */
export async function envoyerBienvenue(
  destinataire: string,
  numeroMembre: number | null,
) {
  const numero = numeroMembre
    ? `<p style="margin:0 0 14px;font-family:'Courier New',monospace;font-size:13px;color:#f5c55a;">MEMBRE N°${numeroMembre}</p>`
    : "";

  await envoyer(
    destinataire,
    "Bienvenue dans le club",
    gabarit({
      apercu: "Ton profil est complet, ton programme se construit.",
      surtitre: "Hybrid Club",
      titre: "Tu es<br>dans le club",
      corps: `${numero}<p style="margin:0;">Ton profil est complet. Ton programme d'entraînement et ton cadre nutritionnel sont construits à partir de tes réponses : ton objectif, ton niveau, ton matériel et tes jours disponibles.</p>
        <p style="margin:14px 0 0;">Une seule chose compte maintenant : t'entraîner. Le reste est déjà écrit.</p>`,
      bouton: { libelle: "Ouvrir mon espace", href: `${SITE}/dashboard` },
      pied: "Tu reçois cet email parce que tu viens de créer ton compte sur hybridclub.fr. Tes données sont exportables et supprimables à tout moment depuis ton compte.",
    }),
  );
}

/** Envoyé quand le programme vient d'être enregistré. */
export async function envoyerProgrammePret(
  destinataire: string,
  jours: number,
) {
  await envoyer(
    destinataire,
    "Ton programme est prêt",
    gabarit({
      apercu: "Tes séances et ta nutrition t'attendent.",
      surtitre: "C'est prêt",
      titre: "Ton programme<br>t'attend",
      corps: `<p style="margin:0;">Il est construit sur ton profil, réparti sur ${jours} séance${jours > 1 ? "s" : ""} par semaine, avec pour chaque exercice ses séries, ses répétitions et sa règle de progression.</p>
        <p style="margin:14px 0 0;">Côté nutrition, tes calories et tes macros sont calculées, avec des idées de repas qui respectent ce que tu manges et ce que tu évites.</p>`,
      bouton: { libelle: "Voir ma séance", href: `${SITE}/dashboard` },
      pied: "Repères d'entraînement et de nutrition calculés à partir de ton profil. Ce ne sont pas des prescriptions médicales ni diététiques. En cas de doute, parles-en à un professionnel de santé.",
    }),
  );
}
