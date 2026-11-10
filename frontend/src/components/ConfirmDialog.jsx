import { AlertTriangle } from 'lucide-react';

import { Spinner } from './Loader';
import Modal from './Modal';

export default function ConfirmDialog({
  open,
  title = 'Delete task?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  onConfirm,
  onClose,
  busy = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm" preventClose={busy}>
      <div className="flex gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-danger-soft text-danger">
          <AlertTriangle className="size-5" aria-hidden="true" />
        </span>
        <p className="pt-1.5 text-sm text-muted">{description}</p>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>
          Cancel
        </button>
        <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy}>
          {busy && <Spinner />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
