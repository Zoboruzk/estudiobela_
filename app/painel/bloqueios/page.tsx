import { Calendar, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { business } from "@/lib/mockData";
import { NewBlockForm } from "@/components/painel/NewBlockForm";
import { DeleteBlockButton } from "@/components/painel/DeleteBlockButton";

// NOTA sobre a query: schedule_blocks é lida com filtro embutido em
// professionals.business_id (join), porque a tabela não tem business_id
// direto — ela só se relaciona com professional_id. A policy de SELECT em
// schedule_blocks é pública (qualquer um pode ler, é isso que alimenta o
// cálculo de disponibilidade do wizard), então aqui na página do painel só
// estamos filtrando pelos profissionais deste negócio.
export default async function BloqueiosPage() {
  const supabase = await createClient();

  const { data: blocks, error } = await supabase
    .from("schedule_blocks")
    .select("id, starts_at, ends_at, reason, professionals!inner(name, business_id)")
    .eq("professionals.business_id", business.id)
    .gte("starts_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
    .order("starts_at", { ascending: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl text-foreground">Bloqueios de agenda</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Marque dias ou horários em que a profissional não atende — férias,
          folgas, consultas, feriados. O horário some automaticamente da
          tela de agendamento dos clientes.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <NewBlockForm />

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-foreground">Próximos bloqueios</h2>
          {error ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar os bloqueios.
            </div>
          ) : !blocks || blocks.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
              Nenhum bloqueio cadastrado.
            </div>
          ) : (
            blocks.map((block) => {
              const start = new Date(block.starts_at);
              const end = new Date(block.ends_at);
              const isFullDay = end.getTime() - start.getTime() >= 24 * 60 * 60_000 - 1000;
              const dateLabel = start.toLocaleDateString("pt-BR", {
                weekday: "short",
                day: "2-digit",
                month: "2-digit",
              });
              // Sem `supabase gen types`, o join vem tipado como array
              // (mesma situação documentada em app/painel/page.tsx).
              const professionalName =
                (block.professionals as unknown as { name: string }[])[0]?.name ??
                "Profissional";

              return (
                <div
                  key={block.id}
                  className="flex items-center justify-between rounded-2xl border border-border bg-card p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      {dateLabel} · {professionalName}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {isFullDay
                        ? "Dia inteiro"
                        : `${start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}
                      {block.reason ? ` · ${block.reason}` : ""}
                    </div>
                  </div>
                  <DeleteBlockButton blockId={block.id} />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
