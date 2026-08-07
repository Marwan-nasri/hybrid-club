"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EtatAuth = { message: string; ok: boolean } | null;

export async function authentifier(
  _etat: EtatAuth,
  formData: FormData,
): Promise<EtatAuth> {
  const email = String(formData.get("email") ?? "").trim();
  const motDePasse = String(formData.get("motDePasse") ?? "");

  if (!email || !motDePasse) {
    return { message: "Renseigne ton email et ton mot de passe.", ok: false };
  }

  const supabase = await createClient();

  if (formData.get("mode") === "inscription") {
    // Le `required` du navigateur ne prouve rien : le consentement RGPD se
    // vérifie ici, où la requête arrive vraiment.
    if (formData.get("consentement") !== "on") {
      return {
        message:
          "Coche la case pour accepter le traitement de tes données avant de créer ton compte.",
        ok: false,
      };
    }

    const origine = (await headers()).get("origin");
    const { error } = await supabase.auth.signUp({
      email,
      password: motDePasse,
      options: { emailRedirectTo: `${origine}/auth/confirm` },
    });

    if (error) {
      // Le détail exact reste côté serveur : il sert à diagnostiquer, pas à
      // être montré au membre.
      console.error("[inscription]", error.code, error.message);
      return { message: messageInscription(error.code, error.message), ok: false };
    }
    // Un écran dédié plutôt qu'un message sous le formulaire : c'est le moment
    // où l'on quitte l'app pour sa boîte mail, et où il faut pouvoir redemander
    // l'email si rien n'arrive.
    redirect(`/connexion/verification?email=${encodeURIComponent(email)}`);
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: motDePasse,
  });

  // Message volontairement vague : ne pas révéler si le compte existe.
  if (error) {
    return { message: "Email ou mot de passe incorrect.", ok: false };
  }

  // /onboarding renvoie lui-même vers / si le profil est déjà rempli : ça
  // suffit à faire la redirection, sans garde supplémentaire ailleurs.
  redirect("/onboarding");
}

export async function deconnexion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/connexion");
}

function messageInscription(code: string | undefined, message: string) {
  switch (code) {
    case "user_already_exists":
    case "email_exists":
      return "Un compte existe déjà avec cet email. Connecte-toi.";
    case "weak_password":
      return "Ton mot de passe doit faire au moins 8 caractères.";
    case "email_address_invalid":
      return "Cette adresse email n'est pas valide.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      // Surtout ne pas dire « réessaie » : chaque tentative repousse le
      // déblocage. Et Supabase vérifie cette limite AVANT de constater qu'un
      // compte existe déjà, donc on renvoie aussi vers la connexion.
      return "Trop de tentatives d'inscription. Si tu as déjà un compte, utilise l'onglet « Se connecter ». Sinon, attends une heure.";
  }
  // Sans code connu, on retombe sur le texte du message.
  if (/already registered|already exists/i.test(message)) {
    return "Un compte existe déjà avec cet email. Connecte-toi.";
  }
  if (/password/i.test(message)) {
    return "Ton mot de passe doit faire au moins 8 caractères.";
  }
  return "L'inscription a échoué. Réessaie dans un instant.";
}
