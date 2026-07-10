import { MapPin, MessageCircle, Clock, Sparkles } from "lucide-react";
import { business } from "@/lib/mockData";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-5xl px-5 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="font-serif text-lg text-foreground">{business.name}</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              {business.tagline}. Um espaço para se cuidar sem pressa.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              {business.address}
            </span>
            <a
              href={`https://wa.me/55${business.whatsapp.replace(/\D/g, "")}`}
              className="inline-flex items-center gap-2 hover:text-foreground"
            >
              <MessageCircle className="h-4 w-4 text-accent" />
              {business.whatsapp}
            </a>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" />
              {business.hours}
            </span>
          </div>
        </div>
        <p className="mt-10 text-xs text-muted-foreground/70">
          © {new Date().getFullYear()} {business.name}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
