import { Calendar, Clock, Scissors, User } from "lucide-react";
import { formatBRL, getProfessionalById, getServiceById } from "@/lib/mockData";

type Props = {
  serviceId: string | null;
  professionalId: string | null;
  date: Date | undefined;
  time: string | null;
};

function formatDate(d: Date | undefined) {
  if (!d) return "—";
  return d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export function BookingSummary({ serviceId, professionalId, date, time }: Props) {
  const service = getServiceById(serviceId);
  const pro = getProfessionalById(professionalId);

  return (
    <div className="rounded-2xl border border-border bg-secondary/40 p-5">
      <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
        Resumo
      </h3>
      <dl className="mt-4 space-y-3 text-sm">
        <Row icon={Scissors} label="Serviço" value={service?.name ?? "—"} />
        <Row icon={User} label="Profissional" value={pro?.name ?? "—"} />
        <Row icon={Calendar} label="Data" value={formatDate(date)} />
        <Row icon={Clock} label="Horário" value={time ?? "—"} />
      </dl>
      {service && (
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-serif text-2xl text-foreground">
            {formatBRL(service.priceBRL)}
          </span>
        </div>
      )}
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="inline-flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4 text-accent" /> {label}
      </dt>
      <dd className="text-right font-medium text-foreground first-letter:uppercase">
        {value}
      </dd>
    </div>
  );
}
