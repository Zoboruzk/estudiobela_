"use client";

import { useLinkStatus } from "next/link";
import { Loader2 } from "lucide-react";

// Precisa ser usado como filho direto de um <Link> do next/link. O hook
// useLinkStatus (Next.js 15+) reporta se aquela navegação específica ainda
// está em andamento — em dev, isso cobre principalmente o tempo de
// compilação sob demanda da rota; em produção, cobre qualquer latência de
// rede real (útil em conexão de celular ruim, o cenário mais comum do
// nosso público). Sem isso, o clique parece "não fazer nada" e a pessoa
// acaba clicando várias vezes.
export function LinkPendingSpinner() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return <Loader2 className="ml-1.5 h-4 w-4 animate-spin" />;
}
