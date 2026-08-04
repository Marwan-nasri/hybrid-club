import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Attente from "./attente";

export default async function Generation() {
  const supabase = await createClient();
  const { data: session } = await supabase.auth.getClaims();
  const id = session?.claims.sub;
  if (!id) redirect("/connexion");

  const { data: profil } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", id)
    .maybeSingle();

  if (!profil?.onboarding_completed) redirect("/onboarding");

  // Programme déjà généré : inutile de repasser par l'écran d'attente.
  const { data: existant } = await supabase
    .from("programs")
    .select("id")
    .eq("user_id", id)
    .eq("status", "active")
    .maybeSingle();

  if (existant) redirect("/dashboard");

  return <Attente />;
}
