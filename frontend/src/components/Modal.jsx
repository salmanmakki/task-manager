import { useEffect } from 'react';
import { X } from 'lucide-react';

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  preventClose = false,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !preventClose) onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose, preventClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="fixed inset-0 animate-fade-in bg-slate-950/50 backdrop-blur-sm"
        onClick={() => {
          if (!preventClose) onClose();
        }}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative max-h-[92dvh] w-full animate-scale-in overflow-y-auto rounded-t-2xl border border-line bg-surface shadow-lift sm:rounded-card ${SIZES[size]}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold tracking-tight">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          <button
            type="button"
            className="icon-btn -mr-1 shrink-0"
            onClick={onClose}
            disabled={preventClose}
            aria-label="Close dialog"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
        <div className="px-5 py-5 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
