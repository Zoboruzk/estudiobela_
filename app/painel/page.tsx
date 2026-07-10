import { Calendar, Check, Clock, User, X } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updateAppointmentStatus } from "@/lib/actions/staff";
import { business, formatBRL } from "@/lib/mockData";
import { cn } from "@/lib/utils";

// Server Component — a query abaixo roda com a sessão do usuário logado
// (não o admin client), então passa pela RLS `appointments_select_staff`.
// Isso é o que garante, no nível do banco, que só quem está vinculado como
// staff deste negócio consegue ver os dados pessoais dos clientes.
export default async function PainelPage() {
  const supabase = await createClient();

  const { data: appointments, error } = await supabase
    .from("appointments")
    .select(
      "id, customer_name, customer_whatsapp, starts_at, status, services(name, price_cents), professionals(name)",
    )
    .eq("business_id", business.id)
    .gte("starts_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
    .order("starts_at", { ascending: true });

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Não foi possível carregar os agendamentos. Tente recarregar a página.
      </div>
    );
  }

  const upcoming = (appointments ?? []).filter((a) => a.status === "confirmed");
  const others = (appointments ?? []).filter((a) => a.status !== "confirmed");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl text-foreground">Agendamentos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A partir de hoje, em ordem cronológica.
        </p>
      </div>

      {upcoming.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
          Nenhum agendamento confirmado a partir de hoje.
        </div>
      ) : (
        <div className="space-y-3">
          {upcoming.map((appt) => (
            <AppointmentCard key={appt.id} appointment={appt} />
          ))}
        </div>
      )}

      {others.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            Concluídos / cancelados
          </h2>
          <div className="space-y-3 opacity-70">
            {others.map((appt) => (
              <AppointmentCard key={appt.id} appointment={appt} readOnly />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// NOTA: sem rodar `supabase gen types typescript`, o cliente não sabe que
// service_id/professional_id são relações "um-para-um" (FK simples) e
// tipa o join como array por segurança. Funciona certo em runtime (sempre
// vem 0 ou 1 item), só ajustamos o tipo aqui. Gerar os tipos oficiais é
// uma melhoria futura que eliminaria essa gambiarra.
type AppointmentRow = {
  id: string;
  customer_name: string;
  customer_whatsapp: string;
  starts_at: string;
  status: string;
  services: { name: string; price_cents: number }[] | null;
  professionals: { name: string }[] | null;
};

const statusLabel: Record<string, string> = {
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
  no_show: "Não compareceu",
};

function AppointmentCard({
  appointment,
  readOnly = false,
}: {
  appointment: AppointmentRow;
  readOnly?: boolean;
}) {
  const date = new Date(appointment.starts_at);
  const dateLabel = date.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
  const timeLabel = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const complete = updateAppointmentStatus.bind(null, appointment.id, "completed");
  const cancel = updateAppointmentStatus.bind(null, appointment.id, "cancelled");
  const noShow = updateAppointmentStatus.bind(null, appointment.id, "no_show");

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <User className="h-4 w-4 text-muted-foreground" />
            {appointment.customer_name}
            <a
              href={`https://wa.me/55${appointment.customer_whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-normal text-accent hover:underline"
            >
              {appointment.customer_whatsapp}
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> {dateLabel}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {timeLabel}
            </span>
            <span>{appointment.services?.[0]?.name ?? "Serviço"}</span>
            <span>· {appointment.professionals?.[0]?.name ?? "Profissional"}</span>
            <span className="font-medium text-foreground">
              {formatBRL((appointment.services?.[0]?.price_cents ?? 0) / 100)}
            </span>
          </div>
        </div>

        {readOnly ? (
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {statusLabel[appointment.status] ?? appointment.status}
          </span>
        ) : (
          <div className="flex gap-2">
            <form action={complete}>
              <button
                type="submit"
                title="Marcar como concluído"
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-accent hover:text-accent",
                )}
              >
                <Check className="h-4 w-4" />
              </button>
            </form>
            <form action={noShow}>
              <button
                type="submit"
                title="Cliente não compareceu"
                className="inline-flex h-8 items-center rounded-full border border-border px-3 text-xs text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
              >
                Não veio
              </button>
            </form>
            <form action={cancel}>
              <button
                type="submit"
                title="Cancelar agendamento"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}