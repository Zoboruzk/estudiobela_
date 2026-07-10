import { cn } from "@/lib/utils";

const labels = ["Serviço", "Profissional", "Data & Hora", "Confirmação"];

export function StepIndicator({ current }: { current: number }) {
  const total = labels.length;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">
          Passo {current} de {total}
        </span>
        <span className="text-muted-foreground">{labels[current - 1]}</span>
      </div>
      <div className="mt-2 flex gap-1.5">
        {labels.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i < current ? "bg-accent" : "bg-border",
            )}
          />
        ))}
      </div>
    </div>
  );
}
