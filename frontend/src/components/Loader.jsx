import { Loader2 } from 'lucide-react';

export function Spinner({ className = 'size-4' }) {
  return <Loader2 className={`animate-spin ${className}`} aria-hidden="true" />;
}

export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-app px-6">
      <div className="flex flex-col items-center gap-4">
        <div className="grid size-12 place-items-center rounded-2xl bg-brand text-white shadow-soft">
          <Loader2 className="size-6 animate-spin" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-muted" aria-live="polite">
          {label}
        </p>
      </div>
    </div>
  );
}
