import { CalendarDays, CheckCircle2, Pencil, RotateCcw, Trash2 } from 'lucide-react';

import {
  PRIORITY_STYLES,
  STATUS_DOTS,
  STATUS_STYLES,
} from '../utils/constants';
import { formatDate, formatDueDate, isOverdue } from '../utils/format';

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  busy = false,
}) {
  const completed = task.status === 'Completed';
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <article className="card group flex h-full flex-col p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`badge ${PRIORITY_STYLES[task.priority]}`}>{task.priority}</span>
          <span className={`badge ${STATUS_STYLES[task.status]}`}>
            <span className={`size-1.5 rounded-full ${STATUS_DOTS[task.status]}`} aria-hidden="true" />
            {task.status}
          </span>
        </div>

        <div className="flex items-center gap-0.5 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          {onEdit && (
            <button
              type="button"
              className="icon-btn size-8"
              onClick={() => onEdit(task)}
              aria-label={`Edit ${task.title}`}
              title="Edit task"
            >
              <Pencil className="size-3.5" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            className="icon-btn size-8 hover:bg-danger-soft hover:text-danger"
            onClick={() => onDelete(task)}
            aria-label={`Delete ${task.title}`}
            title="Delete task"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <h3
        className={`mt-3 text-base font-semibold tracking-tight ${
          completed ? 'text-muted line-through decoration-2 decoration-line' : ''
        }`}
      >
        {task.title}
      </h3>

      {task.description ? (
        <p className="mt-1.5 line-clamp-2 text-sm text-muted">{task.description}</p>
      ) : (
        <p className="mt-1.5 text-sm italic text-muted/70">No description</p>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line/70 pt-4">
        <span
          className={`inline-flex items-center gap-1.5 text-xs ${
            overdue ? 'font-semibold text-danger' : 'text-muted'
          }`}
        >
          <CalendarDays className="size-3.5" aria-hidden="true" />
          {formatDueDate(task.dueDate)}
        </span>

        <button
          type="button"
          className={`btn btn-sm ${
            completed
              ? 'btn-secondary'
              : 'bg-success-soft text-success hover:bg-success hover:text-white'
          }`}
          onClick={() => onStatusChange(task, completed ? 'Pending' : 'Completed')}
          disabled={busy}
        >
          {completed ? (
            <>
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Restore
            </>
          ) : (
            <>
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              Complete
            </>
          )}
        </button>
      </div>

      <p className="mt-2.5 text-[11px] text-muted">Created {formatDate(task.createdAt)}</p>
    </article>
  );
}
