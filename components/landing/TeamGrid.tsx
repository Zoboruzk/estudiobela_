import { ProfessionalCard } from "@/components/shared/ProfessionalCard";
import { professionals } from "@/lib/mockData";

export function TeamGrid() {
  return (
    <section className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-5xl px-5 py-14 md:py-20">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-accent">Nossa Equipe</p>
          <h2 className="mt-2 font-serif text-3xl text-foreground md:text-4xl">
            Profissionais que amam o que fazem
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {professionals.map((p) => (
            <ProfessionalCard key={p.id} professional={p} interactive={false} />
          ))}
        </div>
      </div>
    </section>
  );
}
