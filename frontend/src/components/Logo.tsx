import { Zap } from 'lucide-react';

export function Logo({ size = 24 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <Zap className="text-primary" size={size} strokeWidth={2.5} />
      <span className="font-semibold tracking-tight text-ink-strong" style={{ fontSize: size }}>
        Domine
      </span>
    </div>
  );
}
