import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Next 16 : ce fichier s'appelait `middleware.ts` avant, la fonction `middleware`.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet, headers) {
          // Sur la requête : pour que les Server Components de ce même rendu
          // voient le token rafraîchi et ne tentent pas un second refresh.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          // En-têtes anti-cache fournis par @supabase/ssr : sans eux, un CDN
          // peut servir la session d'un utilisateur à un autre.
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  // Doit être appelé avant que la réponse ne parte, sinon le token rafraîchi
  // ne peut plus être écrit dans les cookies.
  await supabase.auth.getClaims();

  return response;
}

export const config = {
  matcher:
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
};
