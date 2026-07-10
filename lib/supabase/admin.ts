import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ATENÇÃO: este cliente usa a service role key e ignora RLS completamente.
// Só pode ser importado em código que roda no servidor (Server Actions,
// Route Handlers) — NUNCA em Client Components ("use client"), e nunca em
// nada que rode no navegador. A variável SUPABASE_SERVICE_ROLE_KEY não tem
// o prefixo NEXT_PUBLIC_ de propósito: isso impede o Next.js de incluí-la
// no bundle enviado ao navegador.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}