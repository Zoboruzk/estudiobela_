import { ServiceCard } from "@/components/shared/ServiceCard";
import { services } from "@/lib/mockData";

type Props = {
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function ServiceStep({ selectedId, onSelect }: Props) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h2 className="font-serif text-2xl text-foreground md:text-3xl">
        Qual serviço você deseja?
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Escolha um dos nossos serviços para começar.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {services.map((s) => (
          <ServiceCard
            key={s.id}
            service={s}
            selected={selectedId === s.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
