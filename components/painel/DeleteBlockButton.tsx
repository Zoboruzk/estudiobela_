"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { deleteScheduleBlock } from "@/lib/actions/scheduleBlocks";

export function DeleteBlockButton({ blockId }: { blockId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => deleteScheduleBlock(blockId))}
      title="Remover bloqueio"
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  );
}
