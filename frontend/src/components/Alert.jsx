import { AlertCircle } from 'lucide-react';

const TONES = {
  danger: 'border-danger/25 bg-danger-soft text-danger',
  info: 'border-brand/25 bg-brand-soft text-brand',
  success: 'border-success/25 bg-success-soft text-success',
};

export default function Alert({ children, tone = 'danger', className = '' }) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm font-medium ${TONES[tone]} ${className}`}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
