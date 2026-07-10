import { ServiceCard } from "@/components/shared/ServiceCard";
import { services } from "@/lib/mockData";

export function ServicesGrid() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-14 md:py-20">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accent">Serviços</p>
          <h2 className="mt-2 font-serif text-3xl text-foreground md:text-4xl">
            Cuidado feito com calma
          </h2>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {services.map((s) => (
          <ServiceCard key={s.id} service={s} interactive={false} />
        ))}
      </div>
    </section>
  );
}
