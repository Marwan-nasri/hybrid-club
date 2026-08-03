import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Client service role : contourne le RLS. À n'utiliser que pour écrire des
 * données produites par le serveur et jamais par le membre — les programmes
 * générés, et plus tard les webhooks Stripe.
 * L'identité du membre doit être vérifiée AVANT d'appeler ce client.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
