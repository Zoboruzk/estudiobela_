import { ProfessionalCard } from "@/components/shared/ProfessionalCard";
import { getProfessionalsForService } from "@/lib/mockData";

type Props = {
  serviceId: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function ProfessionalStep({ serviceId, selectedId, onSelect }: Props) {
  const list = getProfessionalsForService(serviceId);
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h2 className="font-serif text-2xl text-foreground md:text-3xl">
        Com quem você prefere?
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Estas profissionais atendem o serviço escolhido.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {list.map((p) => (
          <ProfessionalCard
            key={p.id}
            professional={p}
            selected={selectedId === p.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
