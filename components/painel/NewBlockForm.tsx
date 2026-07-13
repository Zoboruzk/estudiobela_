"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createScheduleBlock } from "@/lib/actions/scheduleBlocks";
import { professionals } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export function NewBlockForm() {
  const [scope, setScope] = useState<"professional" | "business">("business");
  const [professionalId, setProfessionalId] = useState(professionals[0]?.id ?? "");
  const [allDay, setAllDay] = useState(true);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("13:00");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!date) {
      setError("Escolha uma data.");
      return;
    }

    startTransition(async () => {
      const result = await createScheduleBlock({
        scope,
        professionalId: scope === "professional" ? professionalId : undefined,
        dateISO: date,
        allDay,
        startTime: allDay ? undefined : startTime,
        endTime: allDay ? undefined : endTime,
        reason: reason.trim() || undefined,
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      setReason("");
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
    >
      <h2 className="text-sm font-medium text-foreground">Novo bloqueio</h2>

      <div className="space-y-1.5">
        <Label>Quem é afetado</Label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setScope("business")}
            className={cn(
              "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
              scope === "business"
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-card text-foreground hover:border-accent",
            )}
          >
            Negócio inteiro
          </button>
          <button
            type="button"
            onClick={() => setScope("professional")}
            className={cn(
              "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
              scope === "professional"
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-card text-foreground hover:border-accent",
            )}
          >
            Só uma profissional
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {scope === "business"
            ? "Bloqueia todas as profissionais de uma vez — ideal para feriados ou para quem atende sozinho(a)."
            : "Bloqueia a agenda de apenas uma profissional específica."}
        </p>
      </div>

      {scope === "professional" && (
        <div className="space-y-1.5">
          <Label htmlFor="professional">Profissional</Label>
          <select
            id="professional"
            value={professionalId}
            onChange={(e) => setProfessionalId(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="date">Data</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setAllDay(true)}
          className={cn(
            "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
            allDay
              ? "border-accent bg-accent text-accent-foreground"
              : "border-border bg-card text-foreground hover:border-accent",
          )}
        >
          Dia inteiro
        </button>
        <button
          type="button"
          onClick={() => setAllDay(false)}
          className={cn(
            "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
            !allDay
              ? "border-accent bg-accent text-accent-foreground"
              : "border-border bg-card text-foreground hover:border-accent",
          )}
        >
          Horário específico
        </button>
      </div>

      {!allDay && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="startTime">Início</Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="endTime">Fim</Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="reason">Motivo (opcional)</Label>
        <Input
          id="reason"
          placeholder="Ex: Consulta médica, folga, feriado..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Button type="submit" disabled={pending} className="w-full rounded-full">
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
          </>
        ) : (
          <>
            <Plus className="mr-1 h-4 w-4" /> Bloquear
          </>
        )}
      </Button>
    </form>
  );
}