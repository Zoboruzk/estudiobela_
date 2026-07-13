import { NextRequest, NextResponse } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

// Domínio raiz da plataforma. Em produção, configure via variável de
// ambiente (NEXT_PUBLIC_ROOT_DOMAIN) — deixei fixo aqui só para o esqueleto
// inicial ficar explícito e fácil de ler.
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "suaapp.com";

// TODO (próxima etapa, quando plugarmos no Supabase de verdade):
// Trocar essa função por uma consulta cacheada (Edge Config, ou fetch com
// `next: { revalidate: 60 }`) na tabela `businesses`, buscando por slug ou
// custom_domain. NÃO bata direto no Supabase sem cache aqui — o middleware
// roda em toda requisição, isso mataria performance e geraria custo.
async function resolveBusiness(
  hostname: string,
  lookupBy: "slug" | "custom_domain",
): Promise<{ id: string; slug: string } | null> {
  // Placeholder de desenvolvimento: só reconhece o negócio mockado
  // "studiobela" para você já poder testar o fluxo de subdomínio localmente.
  if (lookupBy === "slug" && hostname === "studiobela") {
    return { id: "mock-business-id", slug: "studiobela" };
  }
  return null;
}

export async function middleware(req: NextRequest) {
  // Renova a sessão do Supabase primeiro (necessário para /painel e
  // qualquer rota autenticada — ver lib/supabase/middleware.ts). O response
  // resultante carrega os cookies atualizados; seguimos usando ELE (não um
  // NextResponse.next() novo) no restante da função, para não perder essa
  // renovação.
  const sessionResponse = await updateSupabaseSession(req);

  const host = req.headers.get("host") || "";
  const hostname = host.split(":")[0]; // remove porta em dev (localhost:3000)

  let lookupValue: string;
  let lookupBy: "slug" | "custom_domain";

  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    // Ex: studiobela.suaapp.com -> slug = 'studiobela'
    lookupValue = hostname.replace(`.${ROOT_DOMAIN}`, "");
    lookupBy = "slug";
  } else if (
    hostname !== ROOT_DOMAIN &&
    hostname !== `www.${ROOT_DOMAIN}` &&
    hostname !== "localhost" &&
    !hostname.endsWith(".vercel.app") // domínio temporário da Vercel (sem
    // subdomínio próprio ainda) — trata como raiz, sem buscar tenant. Isso é
    // uma bengala válida até existir o primeiro domínio customizado real;
    // nesse ponto, revisar junto com o TODO do resolveBusiness acima.
  ) {
    // Ex: studiobela.com.br -> domínio customizado do cliente
    lookupValue = hostname;
    lookupBy = "custom_domain";
  } else {
    // Acesso pelo domínio raiz (site institucional/marketing, /painel,
    // /login etc.) — sem tenant específico por subdomínio.
    return sessionResponse;
  }

  const business = await resolveBusiness(lookupValue, lookupBy);

  if (!business) {
    return NextResponse.rewrite(new URL("/tenant-not-found", req.url));
  }

  // Injeta o business_id como header interno, disponível em Server
  // Components e Route Handlers via headers() do next/headers. Reaproveita
  // sessionResponse para não perder os cookies renovados acima.
  sessionResponse.headers.set("x-business-id", business.id);
  sessionResponse.headers.set("x-business-slug", business.slug);
  return sessionResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};