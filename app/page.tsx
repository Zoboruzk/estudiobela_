import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { ServicesGrid } from "@/components/landing/ServicesGrid";
import { TeamGrid } from "@/components/landing/TeamGrid";
import { Footer } from "@/components/landing/Footer";

// Server Component — nenhuma interatividade aqui, então isso já roda com
// SSR/SSG completo, ótimo para SEO e performance em conexões móveis.
// TODO (multi-tenant): quando plugarmos no Supabase, os dados de `business`,
// `services` e `professionals` passam a vir de uma query server-side aqui,
// filtrada pelo business_id resolvido no middleware (ver middleware.ts).
export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <ServicesGrid />
        <TeamGrid />
      </main>
      <Footer />
    </div>
  );
}
