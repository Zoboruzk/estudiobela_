"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { getAvailableSlots } from "@/lib/actions/availability";
import type { TimeSlot } from "@/lib/mockData";

type Props = {
  professionalId: string | null;
  durationMinutes: number;
  date: Date | undefined;
  time: string | null;
  onDateChange: (d: Date | undefined) => void;
  onTimeChange: (t: string) => void;
};

// Formata um Date local (do Calendar) como "YYYY-MM-DD", usando os getters
// locais do navegador — não usar toISOString() aqui, que converteria para
// UTC e poderia "voltar" um dia dependendo do horário/fuso.
function toDateOnlyString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function DateTimeStep({
  professionalId,
  durationMinutes,
  date,
  time,
  onDateChange,
  onTimeChange,
}: Props) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    if (!date || !professionalId) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getAvailableSlots({
      professionalId,
      dateISO: toDateOnlyString(date),
      durationMinutes,
    })
      .then((result) => {
        if (!cancelled) setSlots(result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [date, professionalId, durationMinutes]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h2 className="font-serif text-2xl text-foreground md:text-3xl">
        Quando fica melhor?
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Escolha o dia e o horário disponível.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[auto_1fr]">
        <div className="rounded-2xl border border-border bg-card p-2 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateChange}
            disabled={(d) => d < today}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Horários</h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-accent" /> Disponível
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40" /> Ocupado
              </span>
            </div>
          </div>
          {!date ? (
            <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
              Selecione uma data para ver os horários.
            </div>
          ) : loading ? (
            <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando horários...
            </div>
          ) : slots.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
              Não há atendimento nesse dia. Escolha outra data.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot) => {
                const selected = time === slot.time;
                return (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => onTimeChange(slot.time)}
                    className={cn(
                      "h-10 rounded-lg border text-sm font-medium transition-all",
                      slot.available
                        ? selected
                          ? "border-accent bg-accent text-accent-foreground shadow-sm"
                          : "border-border bg-card text-foreground hover:border-accent hover:bg-accent/5"
                        : "cursor-not-allowed border-transparent bg-muted/60 text-muted-foreground/50 line-through",
                    )}
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}