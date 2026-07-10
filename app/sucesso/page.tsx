"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { readConfirmedBooking, type ConfirmedBooking } from "@/lib/bookingStorage";
import { business } from "@/lib/mockData";

export default function SucessoPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<ConfirmedBooking | null | undefined>(undefined);

  useEffect(() => {
    setBooking(readConfirmedBooking());
  }, []);

  useEffect(() => {
    if (booking === null) {
      router.replace("/agendar");
    }
  }, [booking, router]);

  if (booking === undefined || booking === null) {
    return <div className="min-h-screen bg-background" />;
  }

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
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-12">
        <div className="flex flex-col items-center text-center">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-accent/30" />
            <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg">
              <Check className="h-9 w-9" strokeWidth={2.5} />
            </span>
          </div>
          <h1 className="mt-6 font-serif text-3xl text-foreground md:text-4xl">
            Agendamento confirmado!
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Estamos te esperando. Uma confirmação foi enviada para o seu WhatsApp
            com todos os detalhes.
          </p>
        </div>

        <div className="mt-10">
          <BookingSummary
            serviceId={booking.serviceId}
            professionalId={booking.professionalId}
            date={new Date(booking.dateISO)}
            time={booking.time}
          />
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
              <MessageCircle className="h-4 w-4" />
            </span>
            <div className="text-sm">
              <p className="font-medium text-foreground">Notificação enviada</p>
              <p className="mt-0.5 text-muted-foreground">
                Enviamos os detalhes para {booking.customerPhone}. Se precisar
                remarcar, é só responder por lá.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/">Voltar ao início</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
