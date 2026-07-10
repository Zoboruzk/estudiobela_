"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { business } from "@/lib/mockData";
import type { TimeSlot } from "@/lib/mockData";

// ============================================================================
// getAvailableSlots — Server Action
//
// Gera a grade de horários (passo de 30min) cruzando três fontes:
//   1. business_hours  -> em que faixa o profissional atende naquele dia
//   2. schedule_blocks  -> bloqueios pontuais (folga, férias, almoço)
//   3. appointments     -> agendamentos já confirmados
//
// IMPORTANTE sobre fuso horário: assumimos que o navegador do cliente está
// no mesmo fuso do negócio (America/Sao_Paulo, UTC-3 fixo — o Brasil não usa
// mais horário de verão). Por isso construímos os horários candidatos com o
// offset "-03:00" explícito, em vez de depender do fuso do processo Node
// (que em ambientes serverless como a Vercel roda em UTC por padrão — usar
// o fuso "implícito" do servidor aqui geraria uma grade de horários errada,
// deslocada em 3h). Essa mesma suposição (navegador = fuso do negócio) já
// está documentada em app/agendar/page.tsx, na montagem do startsAt.
// ============================================================================

const BUSINESS_TZ_OFFSET = "-03:00";
const SLOT_STEP_MINUTES = 30;

const GetSlotsSchema = z.object({
  professionalId: z.string().uuid(),
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"), // "YYYY-MM-DD"
  durationMinutes: z.number().int().positive(),
});

export type GetAvailableSlotsInput = z.infer<typeof GetSlotsSchema>;

function toInstant(dateISO: string, hhmm: string): Date {
  return new Date(`${dateISO}T${hhmm}:00${BUSINESS_TZ_OFFSET}`);
}

function addMinutes(d: Date, minutes: number): Date {
  return new Date(d.getTime() + minutes * 60_000);
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export async function getAvailableSlots(
  input: GetAvailableSlotsInput,
): Promise<TimeSlot[]> {
  const parsed = GetSlotsSchema.safeParse(input);
  if (!parsed.success) return [];

  const { professionalId, dateISO, durationMinutes } = parsed.data;
  const supabase = createAdminClient();

  // Domingo=0 ... Sábado=6, calculado a partir do calendário puro (sem
  // depender de fuso do processo) — bate com o `weekday` do schema SQL.
  const [year, month, day] = dateISO.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

  const dayStart = toInstant(dateISO, "00:00");
  const dayEnd = addMinutes(dayStart, 24 * 60);

  const [hoursRes, blocksRes, appointmentsRes] = await Promise.all([
    supabase
      .from("business_hours")
      .select("professional_id, start_time, end_time")
      .eq("business_id", business.id)
      .eq("weekday", weekday),
    supabase
      .from("schedule_blocks")
      .select("starts_at, ends_at")
      .eq("professional_id", professionalId)
      .lt("starts_at", dayEnd.toISOString())
      .gt("ends_at", dayStart.toISOString()),
    supabase
      .from("appointments")
      .select("starts_at, ends_at")
      .eq("professional_id", professionalId)
      .eq("status", "confirmed")
      .lt("starts_at", dayEnd.toISOString())
      .gt("ends_at", dayStart.toISOString()),
  ]);

  if (hoursRes.error || blocksRes.error || appointmentsRes.error) {
    console.error("Erro ao buscar disponibilidade:", {
      hoursError: hoursRes.error,
      blocksError: blocksRes.error,
      appointmentsError: appointmentsRes.error,
    });
    return [];
  }

  const allHours = hoursRes.data ?? [];
  // Prioriza horário específico do profissional; se não houver, usa o
  // horário geral do negócio (professional_id null).
  const specific = allHours.filter((h) => h.professional_id === professionalId);
  const businessWide = allHours.filter((h) => h.professional_id === null);
  const ranges = specific.length > 0 ? specific : businessWide;

  if (ranges.length === 0) return []; // fechado nesse dia

  const occupied: { start: Date; end: Date }[] = [
    ...(blocksRes.data ?? []).map((b) => ({
      start: new Date(b.starts_at),
      end: new Date(b.ends_at),
    })),
    ...(appointmentsRes.data ?? []).map((a) => ({
      start: new Date(a.starts_at),
      end: new Date(a.ends_at),
    })),
  ];

  const now = new Date();
  const slotsMap = new Map<string, TimeSlot>();

  function parseHHMMToMinutes(hhmm: string): number {
    const [h, m] = hhmm.slice(0, 5).split(":").map(Number);
    return h * 60 + m;
  }

  function minutesToHHMM(totalMinutes: number): string {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  for (const range of ranges) {
    const rangeStartMin = parseHHMMToMinutes(range.start_time);
    const rangeEndMin = parseHHMMToMinutes(range.end_time);

    for (
      let m = rangeStartMin;
      m + durationMinutes <= rangeEndMin;
      m += SLOT_STEP_MINUTES
    ) {
      const time = minutesToHHMM(m);
      const slotStart = toInstant(dateISO, time);
      const slotEnd = addMinutes(slotStart, durationMinutes);

      const isPast = slotStart < now;
      const isOccupied = occupied.some((o) =>
        overlaps(slotStart, slotEnd, o.start, o.end),
      );

      // Se o mesmo horário já existe no mapa (pode acontecer se houver
      // múltiplas faixas de horário no dia), mantém indisponível se
      // qualquer uma das ocorrências estiver ocupada.
      const existing = slotsMap.get(time);
      slotsMap.set(time, {
        time,
        available: (existing?.available ?? true) && !isOccupied && !isPast,
      });
    }
  }

  return Array.from(slotsMap.values()).sort((a, b) => a.time.localeCompare(b.time));
}
