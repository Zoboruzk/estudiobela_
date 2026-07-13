import { Calendar, Clock, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { business } from "@/lib/mockData";
import { NewBlockForm } from "@/components/painel/NewBlockForm";
import { DeleteBlockButton } from "@/components/painel/DeleteBlockButton";

// NOTA: schedule_blocks agora tem business_id direto (ver migração
// migration_schedule_blocks_business_wide.sql), então filtramos por ele
// sem precisar de join. professional_id pode ser null aqui — significa
// "bloqueio vale para todas as profissionais do negócio" (útil tanto para
// quem atende sozinho(a) quanto para fechamentos gerais, tipo feriado).
// Por isso o join com professionals é deixado como select simples (não
// !inner) — um !inner excluiria justamente os bloqueios de negócio inteiro.
export default async function BloqueiosPage() {
  const supabase = await createClient();

  const { data: blocks, error } = await supabase
    .from("schedule_blocks")
    .select("id, professional_id, starts_at, ends_at, reason, professionals(name)")
    .eq("business_id", business.id)
    .gte("starts_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
    .order("starts_at", { ascending: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl text-foreground">Bloqueios de agenda</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Marque dias ou horários em que não há atendimento — férias, folgas,
          consultas, feriados. Pode valer para uma profissional específica ou
          para o negócio inteiro. O horário some automaticamente da tela de
          agendamento dos clientes.
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
              const professionalName = block.professional_id
                ? ((block.professionals as unknown as { name: string }[])[0]?.name ??
                  "Profissional")
                : null;

              return (
                <div
                  key={block.id}
                  className="flex items-center justify-between rounded-2xl border border-border bg-card p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      {dateLabel}
                      {professionalName ? (
                        <> · {professionalName}</>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                          <Users className="h-3 w-3" /> Todas
                        </span>
                      )}
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