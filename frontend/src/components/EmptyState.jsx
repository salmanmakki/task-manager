import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title, description, action, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-surface/60 px-6 py-14 text-center ${className}`}
    >
      <span className="grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand">
        <Icon className="size-7" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-base font-semibold tracking-tight">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
