"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Mesma suposição de fuso documentada em lib/actions/availability.ts:
// navegador do cliente = fuso do negócio = America/Sao_Paulo (UTC-3 fixo,
// sem horário de verão). Usamos o offset explícito para não depender do
// fuso do processo Node (que em produção serverless costuma rodar em UTC).
const BUSINESS_TZ_OFFSET = "-03:00";

const CreateBlockSchema = z
  .object({
    professionalId: z.string().uuid(),
    dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
    allDay: z.boolean(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    reason: z.string().trim().max(200).optional(),
  })
  .refine((v) => v.allDay || (v.startTime && v.endTime), {
    message: "Informe o horário de início e fim.",
  })
  .refine((v) => v.allDay || (v.startTime && v.endTime && v.startTime < v.endTime), {
    message: "O horário de início precisa ser antes do de fim.",
  });

export type CreateScheduleBlockInput = z.infer<typeof CreateBlockSchema>;

export type CreateScheduleBlockResult =
  | { success: true }
  | { success: false; message: string };

export async function createScheduleBlock(
  input: CreateScheduleBlockInput,
): Promise<CreateScheduleBlockResult> {
  const parsed = CreateBlockSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { professionalId, dateISO, allDay, startTime, endTime, reason } = parsed.data;

  const startsAt = allDay
    ? `${dateISO}T00:00:00${BUSINESS_TZ_OFFSET}`
    : `${dateISO}T${startTime}:00${BUSINESS_TZ_OFFSET}`;
  const endsAt = allDay
    ? new Date(
        new Date(`${dateISO}T00:00:00${BUSINESS_TZ_OFFSET}`).getTime() + 24 * 60 * 60_000,
      ).toISOString()
    : `${dateISO}T${endTime}:00${BUSINESS_TZ_OFFSET}`;

  // Usa o cliente com sessão do usuário (não o admin), de propósito — isso
  // faz o INSERT passar pela RLS `schedule_blocks_manage_staff` de verdade,
  // confirmando que quem está criando o bloqueio é staff do negócio dono
  // desse profissional.
  const supabase = await createClient();

  const { error } = await supabase.from("schedule_blocks").insert({
    professional_id: professionalId,
    starts_at: startsAt,
    ends_at: endsAt,
    reason: reason || null,
  });

  if (error) {
    console.error("Erro ao criar bloqueio:", error);
    return { success: false, message: "Não foi possível criar o bloqueio." };
  }

  revalidatePath("/painel/bloqueios");
  return { success: true };
}

export async function deleteScheduleBlock(blockId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("schedule_blocks").delete().eq("id", blockId);

  if (error) {
    console.error("Erro ao remover bloqueio:", error);
    throw new Error("Não foi possível remover o bloqueio.");
  }

  revalidatePath("/painel/bloqueios");
}
