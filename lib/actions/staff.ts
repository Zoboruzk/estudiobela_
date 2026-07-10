"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// ATENÇÃO: usa o cliente com sessão do usuário (não o admin), de propósito
// — isso faz a atualização passar pela RLS de verdade (appointments_update
// _staff), validando que quem está clicando realmente pertence à equipe
// daquele negócio. Usar o admin client aqui removeria essa proteção.
export async function updateAppointmentStatus(
  appointmentId: string,
  status: "completed" | "cancelled" | "no_show",
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", appointmentId);

  if (error) {
    console.error("Erro ao atualizar status do agendamento:", error);
    throw new Error("Não foi possível atualizar o agendamento.");
  }

  revalidatePath("/painel");
}