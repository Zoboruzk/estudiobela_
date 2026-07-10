"use client";

import { useReducer, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/booking/StepIndicator";
import { ServiceStep } from "@/components/booking/ServiceStep";
import { ProfessionalStep } from "@/components/booking/ProfessionalStep";
import { DateTimeStep } from "@/components/booking/DateTimeStep";
import { ConfirmationStep } from "@/components/booking/ConfirmationStep";
import { isValidPhoneBR } from "@/lib/phoneMask";
import { saveConfirmedBooking } from "@/lib/bookingStorage";
import { createAppointment } from "@/lib/actions/booking";
import { business, getServiceById } from "@/lib/mockData";

type State = {
  step: 1 | 2 | 3 | 4;
  serviceId: string | null;
  professionalId: string | null;
  date: Date | undefined;
  time: string | null;
  name: string;
  phone: string;
};

type Action =
  | { type: "setService"; id: string }
  | { type: "setProfessional"; id: string }
  | { type: "setDate"; date: Date | undefined }
  | { type: "setTime"; time: string }
  | { type: "setName"; value: string }
  | { type: "setPhone"; value: string }
  | { type: "next" }
  | { type: "prev" };

const initialState: State = {
  step: 1,
  serviceId: null,
  professionalId: null,
  date: undefined,
  time: null,
  name: "",
  phone: "",
};

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "setService":
      return {
        ...s,
        serviceId: a.id,
        professionalId: s.serviceId === a.id ? s.professionalId : null,
        date: s.serviceId === a.id ? s.date : undefined,
        time: s.serviceId === a.id ? s.time : null,
      };
    case "setProfessional":
      return {
        ...s,
        professionalId: a.id,
        date: s.professionalId === a.id ? s.date : undefined,
        time: s.professionalId === a.id ? s.time : null,
      };
    case "setDate":
      return { ...s, date: a.date, time: null };
    case "setTime":
      return { ...s, time: a.time };
    case "setName":
      return { ...s, name: a.value };
    case "setPhone":
      return { ...s, phone: a.value };
    case "next":
      return { ...s, step: Math.min(4, s.step + 1) as State["step"] };
    case "prev":
      return { ...s, step: Math.max(1, s.step - 1) as State["step"] };
  }
}

export default function AgendarPage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

  const canContinue =
    (state.step === 1 && !!state.serviceId) ||
    (state.step === 2 && !!state.professionalId) ||
    (state.step === 3 && !!state.date && !!state.time) ||
    (state.step === 4 && state.name.trim().length >= 3 && isValidPhoneBR(state.phone));

  const handleConfirm = async () => {
    if (
      submitting ||
      !canContinue ||
      !state.serviceId ||
      !state.professionalId ||
      !state.date ||
      !state.time
    )
      return;

    setSubmitting(true);
    setSubmitError(null);

    // Combina a data escolhida (Calendar) com o horário (ex: "14:30") num
    // único timestamp. Simplificação para o MVP: assume que o fuso horário
    // do navegador do cliente coincide com o do negócio (business.timezone).
    // Isso é suficiente porque tanto o negócio quanto os clientes que
    // agendam são, na prática, do mesmo fuso — mas vale revisar se algum
    // dia o produto atender clientes fora do Brasil.
    const [hours, minutes] = state.time.split(":").map(Number);
    const startsAt = new Date(state.date);
    startsAt.setHours(hours, minutes, 0, 0);

    const result = await createAppointment({
      serviceId: state.serviceId,
      professionalId: state.professionalId,
      startsAtISO: startsAt.toISOString(),
      customerName: state.name,
      customerWhatsapp: state.phone,
    });

    setSubmitting(false);

    if (!result.success) {
      setSubmitError(result.message);
      if (result.error === "slot_taken") {
        // Alguém reservou esse horário nesse meio-tempo: manda o cliente de
        // volta para a escolha de data/hora, sem perder serviço/profissional.
        dispatch({ type: "setTime", time: "" });
        dispatch({ type: "prev" });
        dispatch({ type: "prev" });
      }
      return;
    }

    // Guarda um resumo só para a tela de sucesso exibir — a fonte de
    // verdade do agendamento já está gravada no banco neste ponto.
    saveConfirmedBooking({
      serviceId: state.serviceId,
      professionalId: state.professionalId,
      dateISO: state.date.toISOString(),
      time: state.time,
      customerName: state.name.trim(),
      customerPhone: state.phone,
    });
    router.push("/sucesso");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-serif text-lg text-foreground">{business.name}</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Cancelar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-32 pt-6">
        <StepIndicator current={state.step} />

        <div className="mt-8">
          {state.step === 1 && (
            <ServiceStep
              selectedId={state.serviceId}
              onSelect={(id) => dispatch({ type: "setService", id })}
            />
          )}
          {state.step === 2 && (
            <ProfessionalStep
              serviceId={state.serviceId}
              selectedId={state.professionalId}
              onSelect={(id) => dispatch({ type: "setProfessional", id })}
            />
          )}
          {state.step === 3 && (
            <DateTimeStep
              professionalId={state.professionalId}
              durationMinutes={getServiceById(state.serviceId)?.durationMin ?? 30}
              date={state.date}
              time={state.time}
              onDateChange={(d) => dispatch({ type: "setDate", date: d })}
              onTimeChange={(t) => dispatch({ type: "setTime", time: t })}
            />
          )}
          {state.step === 4 && (
            <ConfirmationStep
              serviceId={state.serviceId}
              professionalId={state.professionalId}
              date={state.date}
              time={state.time}
              name={state.name}
              phone={state.phone}
              onNameChange={(v) => dispatch({ type: "setName", value: v })}
              onPhoneChange={(v) => dispatch({ type: "setPhone", value: v })}
            />
          )}
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-5 py-4">
          {submitError && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {submitError}
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => dispatch({ type: "prev" })}
              disabled={state.step === 1 || submitting}
              className="rounded-full"
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
            </Button>
            {state.step < 4 ? (
              <Button
                onClick={() => dispatch({ type: "next" })}
                disabled={!canContinue}
                size="lg"
                className="rounded-full px-6"
              >
                Continuar <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleConfirm}
                disabled={!canContinue || submitting}
                size="lg"
                className="rounded-full px-6"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Confirmando...
                  </>
                ) : (
                  "Confirmar Agendamento"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}