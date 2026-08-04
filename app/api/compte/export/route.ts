import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Export RGPD : toutes les données du membre, dans un fichier JSON lisible.
 * Chaque requête passe par la session du membre, donc le RLS garantit qu'on
 * n'exporte jamais les données de quelqu'un d'autre — même en cas d'erreur
 * de filtre de notre part.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: session } = await supabase.auth.getClaims();
  const userId = session?.claims.sub;
  if (!userId) {
    return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  }

  const [profil, programmes, seances, abonnement] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("programs").select("*").eq("user_id", userId),
    supabase.from("workout_logs").select("*").eq("user_id", userId),
    supabase.from("subscriptions").select("*").eq("user_id", userId).maybeSingle(),
  ]);

  const donnees = {
    exporte_le: new Date().toISOString(),
    compte: {
      id: userId,
      email: session?.claims.email ?? null,
    },
    profil: profil.data ?? null,
    programmes: programmes.data ?? [],
    seances: seances.data ?? [],
    abonnement: abonnement.data ?? null,
  };

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(donnees, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="hybrid-club-mes-donnees-${date}.json"`,
      // Ces données sont personnelles : aucun cache, nulle part.
      "Cache-Control": "no-store",
    },
  });
}
