import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Nav from "./nav";

export default async function LayoutApp({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return (
    <div className="flex min-h-dvh flex-col bg-white dark:bg-black">
      {/* pb-20 : la barre du bas est fixe, sans ça elle recouvre le contenu. */}
      <div className="flex-1 pb-20">{children}</div>
      <Nav />
    </div>
  );
}
