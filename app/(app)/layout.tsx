import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const ONGLETS = [
  { href: "/dashboard", libelle: "Aujourd'hui" },
  { href: "/programme", libelle: "Programme" },
];

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

      <nav className="fixed inset-x-0 bottom-0 border-t border-black/10 bg-white/95 backdrop-blur dark:border-white/15 dark:bg-black/95">
        <ul className="mx-auto flex max-w-sm">
          {ONGLETS.map((onglet) => (
            <li key={onglet.href} className="flex-1">
              <Link
                href={onglet.href}
                className="flex h-16 items-center justify-center text-sm font-medium"
              >
                {onglet.libelle}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
