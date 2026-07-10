import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Renova a sessão do Supabase (cookies) a cada request. Isso é necessário
// porque o Next.js App Router não tem um jeito automático de refrescar o
// token de autenticação — sem isso, o login expiraria mais cedo do que
// deveria e o staff seria deslogado sem razão aparente.
export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options?: CookieOptions }[],
        ) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() força a validação/renovação do token — não trocar por
  // getSession(), que não recontacta o servidor de autenticação.
  await supabase.auth.getUser();

  return response;
}
