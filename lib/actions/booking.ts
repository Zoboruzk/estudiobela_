"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { business } from "@/lib/mockData";

// ============================================================================
// createAppointment — Server Action
//
// Faz o INSERT real na tabela `appointments`. A política de RLS
// `appointments_insert_public` permite esse insert sem autenticação (é o
// cliente final agendando), desde que o negócio esteja ativo — ver
// schema_agendamento.sql. O trigger `set_appointment_end_time` calcula
// `ends_at` automaticamente a partir da duração do serviço, então não
// precisamos calcular isso aqui.
//
// O ponto mais importante desta função é o tratamento do código de erro
// 23P01: é o Postgres rejeitando o INSERT porque a EXCLUDE CONSTRAINT
// (professional_id + intervalo de tempo) detectou sobreposição com outro
// agendamento confirmado. Isso acontece quando dois clientes tentam
// reservar o mesmo horário do mesmo profissional ao mesmo tempo — a trava
// é atômica no banco, então tratamos aqui devolvendo um erro específico
// para o front pedir que o cliente escolha outro horário.
// ============================================================================

const CreateAppointmentSchema = z.object({
  serviceId: z.string().uuid(),
  professionalId: z.string().uuid(),
  startsAtISO: z.string().datetime({ offset: true }).or(z.string().datetime()),
  customerName: z.string().trim().min(3, "Nome muito curto"),
  customerWhatsapp: z
    .string()
    .refine((v) => v.replace(/\D/g, "").length === 11, "WhatsApp inválido"),
});

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;

export type CreateAppointmentResult =
  | { success: true; appointmentId: string }
  | { success: false; error: "validation_error" | "slot_taken" | "unknown_error"; message: string };

export async function createAppointment(
  input: CreateAppointmentInput,
): Promise<CreateAppointmentResult> {
  const parsed = CreateAppointmentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "validation_error",
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const { serviceId, professionalId, startsAtISO, customerName, customerWhatsapp } = parsed.data;

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      business_id: business.id,
      professional_id: professionalId,
      service_id: serviceId,
      customer_name: customerName,
      customer_whatsapp: customerWhatsapp,
      starts_at: startsAtISO,
      status: "confirmed",
    })
    .select("id")
    .single();

  if (error) {
    // 23P01 = exclusion_violation -> a EXCLUDE CONSTRAINT barrou o choque de horário
    if (error.code === "23P01") {
      return {
        success: false,
        error: "slot_taken",
        message:
          "Esse horário acabou de ser reservado por outra pessoa. Escolha outro horário.",
      };
    }

    console.error("Erro ao criar agendamento:", error);
    return {
      success: false,
      error: "unknown_error",
      message: "Não foi possível confirmar o agendamento. Tente novamente.",
    };
  }

  return { success: true, appointmentId: data.id };
}