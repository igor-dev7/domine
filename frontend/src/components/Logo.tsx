import { Zap } from 'lucide-react';

export function Logo({ size = 24, iconOnly = false }: { size?: number; iconOnly?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Zap className="text-primary shrink-0" size={size} strokeWidth={2.5} />
      {!iconOnly && (
        <span
          className="whitespace-nowrap font-semibold tracking-tight text-ink-strong"
          style={{ fontSize: size }}
        >
          Domine
        </span>
      )}
    </div>
  );
}
