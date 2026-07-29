import { cn } from "@/lib/utils";

interface Props {
  requires_usef?: boolean;
  requires_usea?: boolean;
  requires_usdf?: boolean;
  className?: string;
}

const Badge = ({ label }: { label: string }) => (
  <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded bg-mist text-charcoal border border-border">
    {label}
  </span>
);

export function MembershipBadges({ requires_usef, requires_usea, requires_usdf, className }: Props) {
  const badges = [
    requires_usef && "USEF",
    requires_usea && "USEA",
    requires_usdf && "USDF",
  ].filter(Boolean) as string[];

  if (!badges.length) return null;

  return (
    <div className={cn("flex gap-1 flex-wrap", className)}>
      {badges.map((b) => <Badge key={b} label={b} />)}
    </div>
  );
}
