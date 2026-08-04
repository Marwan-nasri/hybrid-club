import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type Programme, trouverSeance } from "@/lib/programme";
import Formulaire, { type Precedent } from "./formulaire";

export default async function PageSeance({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;

  const supabase = await createClient();
  const { data: session } = await supabase.auth.getClaims();
  const userId = session?.claims.sub;
  if (!userId) redirect("/connexion");

  const { data: ligne } = await supabase
    .from("programs")
    .select("program_json")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle<{ program_json: Programme }>();

  if (!ligne) redirect("/generation");

  const seance = trouverSeance(ligne.program_json, key);
  if (!seance) notFound();

  // Dernière fois que cette séance a été faite : sert de repère de charge.
  const { data: dernier } = await supabase
    .from("workout_logs")
    .select("exercises_json")
    .eq("user_id", userId)
    .eq("session_key", key)
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle<{
      exercises_json: {
        type: string;
        exercises?: { name: string; series: Precedent[string] }[];
      };
    }>();

  const precedent: Precedent = Object.fromEntries(
    (dernier?.exercises_json?.exercises ?? []).map((e) => [e.name, e.series]),
  );

  return (
    <main className="mx-auto w-full max-w-sm px-5 py-8">
      <Link href="/dashboard" className="text-sm opacity-60">
        ← Retour
      </Link>

      <header className="mt-4 mb-8">
        <p className="text-xs font-medium uppercase tracking-wide opacity-50">
          {seance.type === "cardio" ? "Cardio" : "Musculation"}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {seance.name}
        </h1>
      </header>

      <Formulaire seance={seance} precedent={precedent} />
    </main>
  );
}
