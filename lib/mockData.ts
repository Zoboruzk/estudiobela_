// ============================================================================
// DADOS MOCKADOS — ponto de partida para os tipos reais do Supabase.
//
// IMPORTANTE: os IDs abaixo (business.id, services[].id, professionals[].id)
// são UUIDs FIXOS que devem bater exatamente com o que está em seed.sql.
// Isso é temporário — quando a landing/wizard passarem a buscar do Supabase
// (próxima etapa), este arquivo deixa de ser a fonte de dados e vira só a
// definição dos tipos TypeScript (Service, Professional, Business, TimeSlot).
// Por ora, o INSERT real de agendamento (Server Action) usa esses IDs para
// referenciar as linhas correspondentes no banco.
// ============================================================================

import { Scissors, Wind, Palette, Hand, type LucideIcon } from "lucide-react";

export type Service = {
  id: string;
  name: string;
  durationMin: number;
  priceBRL: number;
  icon: LucideIcon;
  description: string;
};

export type Professional = {
  id: string;
  name: string;
  role: string;
  serviceIds: string[];
  tone: string; // classe Tailwind de fundo para o placeholder de foto
};

export type Business = {
  id: string;
  name: string;
  tagline: string;
  address: string;
  whatsapp: string;
  hours: string;
};

export type TimeSlot = {
  time: string;
  available: boolean;
};

export const business: Business = {
  id: "a0000000-0000-4000-8000-000000000001",
  name: "Studio Bela",
  tagline: "Espaço de Beleza",
  address: "Rua das Palmeiras, 123 — Vila Madalena, São Paulo/SP",
  whatsapp: "(11) 98765-4321",
  hours: "Ter a Sáb · 09h às 19h",
};

export const services: Service[] = [
  {
    id: "b0000000-0000-4000-8000-000000000001",
    name: "Corte Feminino",
    durationMin: 60,
    priceBRL: 80,
    icon: Scissors,
    description: "Corte personalizado com finalização",
  },
  {
    id: "b0000000-0000-4000-8000-000000000002",
    name: "Escova",
    durationMin: 40,
    priceBRL: 50,
    icon: Wind,
    description: "Escova modeladora com produtos premium",
  },
  {
    id: "b0000000-0000-4000-8000-000000000003",
    name: "Coloração",
    durationMin: 120,
    priceBRL: 150,
    icon: Palette,
    description: "Coloração completa ou retoque de raiz",
  },
  {
    id: "b0000000-0000-4000-8000-000000000004",
    name: "Manicure",
    durationMin: 30,
    priceBRL: 35,
    icon: Hand,
    description: "Cuidado completo para suas mãos",
  },
];

export const professionals: Professional[] = [
  {
    id: "c0000000-0000-4000-8000-000000000001",
    name: "Ana Paula",
    role: "Cabeleireira & Colorista",
    serviceIds: [
      "b0000000-0000-4000-8000-000000000001",
      "b0000000-0000-4000-8000-000000000002",
      "b0000000-0000-4000-8000-000000000003",
    ],
    tone: "bg-[oklch(0.78_0.08_40)]",
  },
  {
    id: "c0000000-0000-4000-8000-000000000002",
    name: "Rayane",
    role: "Cabeleireira",
    serviceIds: [
      "b0000000-0000-4000-8000-000000000001",
      "b0000000-0000-4000-8000-000000000002",
      "b0000000-0000-4000-8000-000000000004",
    ],
    tone: "bg-[oklch(0.82_0.06_60)]",
  },
  {
    id: "c0000000-0000-4000-8000-000000000003",
    name: "Camila",
    role: "Manicure",
    serviceIds: [
      "b0000000-0000-4000-8000-000000000004",
      "b0000000-0000-4000-8000-000000000002",
    ],
    tone: "bg-[oklch(0.75_0.09_25)]",
  },
];

export function getServiceById(id: string | null): Service | undefined {
  return services.find((s) => s.id === id);
}

export function getProfessionalById(id: string | null): Professional | undefined {
  return professionals.find((p) => p.id === id);
}

export function getProfessionalsForService(serviceId: string | null): Professional[] {
  if (!serviceId) return [];
  return professionals.filter((p) => p.serviceIds.includes(serviceId));
}

// Pseudo-aleatório determinístico usando a data como seed (só para mock).
// Isso NÃO substitui a validação real de disponibilidade — no backend real,
// generateTimeSlots vira uma query que cruza business_hours + schedule_blocks
// + appointments confirmados para aquele profissional/dia.
function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return () => {
    h = Math.imul(48271, h) | 0;
    return ((h >>> 0) % 1000) / 1000;
  };
}

export function generateTimeSlots(date: Date | undefined): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let h = 9; h < 19; h++) {
    for (const m of [0, 30]) {
      slots.push({
        time: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
        available: true,
      });
    }
  }
  if (!date) return slots;
  const rand = seededRandom(date.toDateString());
  const occupiedCount = 4 + Math.floor(rand() * 3);
  const indices = new Set<number>();
  while (indices.size < occupiedCount) {
    indices.add(Math.floor(rand() * slots.length));
  }
  indices.forEach((i) => (slots[i].available = false));
  return slots;
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}