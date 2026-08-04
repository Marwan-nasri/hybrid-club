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
    <div className="flex min-h-dvh flex-col">
      {/* La barre du bas est fixe : sans cette réserve elle recouvre le
          contenu, et sur iPhone la zone du bas est encore plus haute. */}
      <div className="flex-1 pb-[calc(6rem+env(safe-area-inset-bottom))]">
        {children}
      </div>
      <Nav />
    </div>
  );
}
