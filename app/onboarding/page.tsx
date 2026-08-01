import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Formulaire from "./formulaire";

export default async function Onboarding() {
  const supabase = await createClient();
  const { data: session } = await supabase.auth.getClaims();
  const id = session?.claims.sub;
  if (!id) redirect("/connexion");

  const { data: profil } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", id)
    .maybeSingle();

  if (profil?.onboarding_completed) redirect("/");

  return <Formulaire />;
}
