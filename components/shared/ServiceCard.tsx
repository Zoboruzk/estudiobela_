import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBRL, type Service } from "@/lib/mockData";

type Props = {
  service: Service;
  selected?: boolean;
  onSelect?: (id: string) => void;
  interactive?: boolean;
};

export function ServiceCard({ service, selected, onSelect, interactive = true }: Props) {
  const Icon = service.icon;
  const Comp = interactive ? "button" : "div";
  return (
    <Comp
      type={interactive ? "button" : undefined}
      onClick={interactive ? () => onSelect?.(service.id) : undefined}
      className={cn(
        "group relative w-full text-left rounded-2xl border bg-card p-5 transition-all",
        "shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
        interactive && "hover:border-accent hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        selected ? "border-accent ring-2 ring-accent/40 bg-accent/5" : "border-border",
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors",
            selected ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground",
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-medium text-foreground leading-tight">{service.name}</h3>
            {selected && (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {service.description}
          </p>
          <div className="mt-3 flex items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> {service.durationMin}min
            </span>
            <span className="font-semibold text-foreground">{formatBRL(service.priceBRL)}</span>
          </div>
        </div>
      </div>
    </Comp>
  );
}
