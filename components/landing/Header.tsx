import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkPendingSpinner } from "@/components/shared/LinkPendingSpinner";
import { business } from "@/lib/mockData";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Sparkles className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="font-serif text-lg leading-none text-foreground">
            {business.name}
          </span>
        </Link>
        <Button asChild size="sm" className="rounded-full">
          <Link href="/agendar">
            Agendar <LinkPendingSpinner />
          </Link>
        </Button>
      </div>
    </header>
  );
}