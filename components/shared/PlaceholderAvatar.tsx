import { User, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  icon?: LucideIcon;
  tone?: string;
  className?: string;
  iconClassName?: string;
};

export function PlaceholderAvatar({
  icon: Icon = User,
  tone = "bg-accent",
  className,
  iconClassName,
}: Props) {
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden",
        tone,
        className,
      )}
    >
      <Icon className={cn("text-white/85", iconClassName)} strokeWidth={1.5} />
    </div>
  );
}
