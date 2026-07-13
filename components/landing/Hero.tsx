import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkPendingSpinner } from "@/components/shared/LinkPendingSpinner";
import { business } from "@/lib/mockData";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/8 to-transparent" />
      <div className="mx-auto max-w-5xl px-5 pt-14 pb-16 md:pt-24 md:pb-24">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Agendamentos abertos para esta semana
          </span>
          <h1 className="mt-5 font-serif text-4xl leading-[1.05] tracking-tight text-foreground md:text-6xl">
            {business.name} —<br />
            <span className="text-accent">{business.tagline}</span>
          </h1>
          <p className="mt-5 max-w-lg text-base text-muted-foreground md:text-lg">
            Um espaço pensado para o seu cuidado. Escolha o serviço, a
            profissional e o melhor horário — em menos de um minuto.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="rounded-full px-6">
              <Link href="/agendar">
                Agendar Horário <ArrowRight className="ml-1 h-4 w-4" />
                <LinkPendingSpinner />
              </Link>
            </Button>
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" /> Vila Madalena, SP
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}