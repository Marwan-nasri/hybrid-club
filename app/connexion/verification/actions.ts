"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type EtatRenvoi = { message: string; ok: boolean } | null;

export async function renvoyerConfirmation(
  _etat: EtatRenvoi,
  formData: FormData,
): Promise<EtatRenvoi> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { message: "Adresse manquante. Reprends l'inscription.", ok: false };
  }

  const supabase = await createClient();
  const origine = (await headers()).get("origin");

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${origine}/auth/confirm` },
  });

  if (error) {
    console.error("[renvoi]", error.code, error.message);
    if (
      error.code === "over_email_send_rate_limit" ||
      error.code === "over_request_rate_limit"
    ) {
      return {
        message: "Patiente une minute avant de redemander un email.",
        ok: false,
      };
    }
    // Tout autre échec reste vague : dire « ce compte n'existe pas » ou « il
    // est déjà confirmé » permettrait de tester des adresses une par une.
    return {
      message: "Si un compte existe pour cette adresse, l'email est reparti.",
      ok: true,
    };
  }

  return { message: "C'est reparti. Regarde ta boîte, et tes spams.", ok: true };
}
