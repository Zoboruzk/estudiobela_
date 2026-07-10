// ATENÇÃO: isso ainda é um placeholder client-side (sessionStorage), igual ao
// protótipo da Lovable. Quando plugarmos no Supabase de verdade, o fluxo de
// confirmação em app/agendar/page.tsx passa a fazer um INSERT real na tabela
// `appointments` (via Server Action) em vez de gravar aqui — ver TODO em
// app/agendar/page.tsx.
export type ConfirmedBooking = {
  serviceId: string;
  professionalId: string;
  dateISO: string;
  time: string;
  customerName: string;
  customerPhone: string;
};

const KEY = "booking-confirmation";

export function saveConfirmedBooking(b: ConfirmedBooking) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(b));
}

export function readConfirmedBooking(): ConfirmedBooking | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ConfirmedBooking;
  } catch {
    return null;
  }
}

export function clearConfirmedBooking() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}
