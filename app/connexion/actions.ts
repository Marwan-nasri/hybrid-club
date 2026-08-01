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
    const origine = (await headers()).get("origin");
    const { error } = await supabase.auth.signUp({
      email,
      password: motDePasse,
      options: { emailRedirectTo: `${origine}/auth/confirm` },
    });

    if (error) {
      return { message: messageInscription(error.message), ok: false };
    }
    return {
      message: "Compte créé. Clique sur le lien qu'on vient de t'envoyer par email.",
      ok: true,
    };
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

function messageInscription(erreur: string) {
  if (/already registered|already exists/i.test(erreur)) {
    return "Un compte existe déjà avec cet email. Connecte-toi.";
  }
  if (/password/i.test(erreur)) {
    return "Ton mot de passe doit faire au moins 8 caractères.";
  }
  return "L'inscription a échoué. Réessaie dans un instant.";
}
