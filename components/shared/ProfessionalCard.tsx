import { Check, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlaceholderAvatar } from "./PlaceholderAvatar";
import { services, type Professional } from "@/lib/mockData";

type Props = {
  professional: Professional;
  selected?: boolean;
  onSelect?: (id: string) => void;
  interactive?: boolean;
};

export function ProfessionalCard({
  professional,
  selected,
  onSelect,
  interactive = true,
}: Props) {
  const specialties = professional.serviceIds
    .map((id) => services.find((s) => s.id === id)?.name)
    .filter(Boolean)
    .join(" · ");

  const Comp = interactive ? "button" : "div";
  return (
    <Comp
      type={interactive ? "button" : undefined}
      onClick={interactive ? () => onSelect?.(professional.id) : undefined}
      className={cn(
        "group relative w-full text-left rounded-2xl border bg-card p-5 transition-all",
        "shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
        interactive && "hover:border-accent hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        selected ? "border-accent ring-2 ring-accent/40 bg-accent/5" : "border-border",
      )}
    >
      <div className="flex items-center gap-4">
        <PlaceholderAvatar
          icon={User}
          tone={professional.tone}
          className="h-14 w-14 rounded-full"
          iconClassName="h-6 w-6"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-foreground leading-tight">{professional.name}</h3>
            {selected && (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{professional.role}</p>
          <p className="mt-2 text-xs text-muted-foreground/80 line-clamp-2">
            {specialties}
          </p>
        </div>
      </div>
    </Comp>
  );
}
