import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/lib/actions/staff";
import { business } from "@/lib/mockData";

// Server Component: valida sessão + vínculo de staff ANTES de renderizar
// qualquer coisa do painel. Isso é a checagem de UX (redireciona pra
// /login); a proteção de dados de verdade continua sendo a RLS no banco
// (appointments_select_staff) — mesmo que alguém pulasse essa checagem,
// as queries no banco ainda barrariam o acesso.
export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: staffRow } = await supabase
    .from("staff")
    .select("role")
    .eq("user_id", user.id)
    .eq("business_id", business.id)
    .maybeSingle();

  if (!staffRow) {
    // Usuário autenticado, mas sem vínculo de staff com este negócio —
    // não é um cliente comum tentando acessar por engano, então avisamos
    // e deslogamos, em vez de silenciosamente redirecionar sem contexto.
    redirect("/login?erro=sem-acesso");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="font-serif text-lg leading-none text-foreground">
                {business.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {user.email} · {staffRow.role === "owner" ? "Proprietária(o)" : "Equipe"}
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/painel"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Agendamentos
            </Link>
            <Link
              href="/painel/bloqueios"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Bloqueios
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-8">{children}</main>
    </div>
  );
}