# Agendamento App — Esqueleto de Produção (Next.js)

Transplante do protótipo visual gerado na Lovable (`easy-booking-studio`)
para uma base Next.js 15 (App Router) pronta para produção — sem
dependência de TanStack Start/Nitro, sem assets externos, sem backend
real ainda conectado.

## Setup local

```bash
npm install
cp .env.local.example .env.local
# preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
# (essas duas variáveis ainda não são usadas por nenhum componente —
# o app roda 100% com dados mockados até o próximo passo)
npm run dev
```

Acesse `http://localhost:3000`.

## O que já está pronto

- Landing page (`app/page.tsx`) — Server Component, SEO-friendly
- Wizard de agendamento completo (`app/agendar/page.tsx`) — 4 passos,
  com validação e reducer tipado
- Tela de confirmação (`app/sucesso/page.tsx`) — `noindex`
- Design system idêntico ao protótipo aprovado (paleta OKLCH, Fraunces +
  Inter via `next/font/google`, shadcn/ui estilo "new-york")
- `middleware.ts` — esqueleto de resolução de tenant por subdomínio/domínio
  customizado (hoje reconhece só `studiobela` como mock; ver TODO no arquivo)
- Clientes Supabase prontos em `lib/supabase/client.ts` (browser) e
  `lib/supabase/server.ts` (Server Components/Actions) — ainda não usados
  em nenhuma página

## Próximos passos (nesta ordem)

1. Rodar o `schema_agendamento.sql` no seu projeto Supabase
2. Trocar `lib/mockData.ts` por queries reais (`services`, `professionals`,
   `businesses`) nas Server Components (`app/page.tsx`, `app/agendar/page.tsx`)
3. Trocar `saveConfirmedBooking` (sessionStorage, em
   `app/agendar/page.tsx`) por uma Server Action que faz `INSERT` real em
   `appointments`, tratando o erro `23P01` (choque de horário)
4. Deploy da Edge Function `notify-whatsapp` + configurar o Database Webhook
5. Conectar o `middleware.ts` a uma consulta cacheada real de negócios
   (Edge Config ou fetch com revalidate) em vez do mock hardcoded
6. Deploy na Vercel + configurar domínio wildcard `*.suaapp.com`

## Estrutura de pastas

```
app/
  page.tsx              → landing page
  agendar/page.tsx       → wizard de agendamento (client component)
  sucesso/               → confirmação (client component + layout noindex)
  tenant-not-found/      → página de fallback do middleware
components/
  landing/                → Header, Hero, ServicesGrid, TeamGrid, Footer
  booking/                → StepIndicator + os 4 steps do wizard
  shared/                 → ServiceCard, ProfessionalCard, PlaceholderAvatar
  ui/                     → primitives shadcn (button, input, label, calendar)
lib/
  mockData.ts             → dados mockados (types = base dos tipos do Supabase)
  supabase/                → clientes browser e server
middleware.ts              → resolução de tenant por domínio
```
