import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Logo({
  to = '/',
  inverted = false,
  compact = false,
  className = '',
  onClick,
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 ${className}`}
      aria-label="TaskFlow home"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-linear-to-br from-indigo-500 to-indigo-700 text-white shadow-soft">
        <Check className="size-5" strokeWidth={3} aria-hidden="true" />
      </span>
      {!compact && (
        <span
          className={`text-lg font-bold tracking-tight ${inverted ? 'text-white' : 'text-ink'}`}
        >
          TaskFlow
        </span>
      )}
    </Link>
  );
}
