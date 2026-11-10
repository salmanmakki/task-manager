const TONES = {
  brand: 'bg-brand-soft text-brand',
  warning: 'bg-warning-soft text-warning',
  success: 'bg-success-soft text-success',
  danger: 'bg-danger-soft text-danger',
};

export default function StatCard({ label, value, icon: Icon, tone = 'brand', hint }) {
  return (
    <div className="card p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
        </div>
        <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${TONES[tone]}`}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}
