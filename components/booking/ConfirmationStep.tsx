import { BookingSummary } from "./BookingSummary";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { maskPhoneBR } from "@/lib/phoneMask";

type Props = {
  serviceId: string | null;
  professionalId: string | null;
  date: Date | undefined;
  time: string | null;
  name: string;
  phone: string;
  onNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
};

export function ConfirmationStep({
  serviceId,
  professionalId,
  date,
  time,
  name,
  phone,
  onNameChange,
  onPhoneChange,
}: Props) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h2 className="font-serif text-2xl text-foreground md:text-3xl">
        Só falta você
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Confira o resumo e informe seus dados para finalizar.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <BookingSummary
          serviceId={serviceId}
          professionalId={professionalId}
          date={date}
          time={time}
        />

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Como podemos te chamar?"
              className="mt-1.5 h-11 rounded-xl"
              autoComplete="name"
            />
          </div>
          <div>
            <Label htmlFor="phone">WhatsApp</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => onPhoneChange(maskPhoneBR(e.target.value))}
              placeholder="(11) 98765-4321"
              inputMode="tel"
              className="mt-1.5 h-11 rounded-xl"
              autoComplete="tel"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Enviaremos a confirmação por aqui.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
