import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';

import { createTaskRequest, updateTaskRequest } from '../services/taskService';
import { getApiError } from '../services/api';
import { PRIORITIES, PRIORITY_STYLES, STATUSES } from '../utils/constants';
import { toDateInputValue } from '../utils/format';
import { validateTask } from '../utils/validation';
import Alert from './Alert';
import { Spinner } from './Loader';
import Modal from './Modal';

const EMPTY_FORM = {
  title: '',
  description: '',
  priority: 'Medium',
  status: 'Pending',
  dueDate: '',
};

const getInitialForm = (task) =>
  task
    ? {
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        dueDate: toDateInputValue(task.dueDate),
      }
    : EMPTY_FORM;

export default function TaskModal({ open, task, onClose, onSaved }) {
  const [form, setForm] = useState(() => getInitialForm(task));
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(task);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setServerError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateTask(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    setServerError('');

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      status: form.status,
      // Noon local time keeps the calendar date stable across timezones.
      dueDate: form.dueDate ? new Date(`${form.dueDate}T12:00:00`).toISOString() : null,
    };

    try {
      const saved = isEditing
        ? await updateTaskRequest(task._id, payload)
        : await createTaskRequest(payload);

      toast.success(isEditing ? 'Task updated' : 'Task created');
      onSaved?.(saved);
      onClose();
    } catch (error) {
      const message = getApiError(error);
      setServerError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      preventClose={saving}
      title={isEditing ? 'Edit task' : 'Create a task'}
      description={
        isEditing
          ? 'Update the details and keep your workspace current.'
          : 'Capture what needs to happen, then set a priority and due date.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {serverError && <Alert>{serverError}</Alert>}

        <div>
          <label className="label" htmlFor="task-title">
            Task title
          </label>
          <input
            id="task-title"
            className="input"
            type="text"
            placeholder="e.g. Prepare the sprint plan"
            maxLength={120}
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            autoFocus
          />
          {errors.title && <p className="field-error">{errors.title}</p>}
        </div>

        <div>
          <label className="label" htmlFor="task-description">
            Description <span className="font-normal text-muted">(optional)</span>
          </label>
          <textarea
            id="task-description"
            className="input min-h-24 resize-y"
            placeholder="Add context, links or acceptance criteria..."
            maxLength={2000}
            value={form.description}
            onChange={(event) => updateField('description', event.target.value)}
          />
          <div className="mt-1.5 flex items-center justify-between">
            {errors.description ? (
              <p className="field-error !mt-0">{errors.description}</p>
            ) : (
              <span />
            )}
            <span className="text-[11px] text-muted">{form.description.length}/2000</span>
          </div>
        </div>

        <div>
          <span className="label">Priority</span>
          <div className="grid grid-cols-3 gap-2" role="group" aria-label="Task priority">
            {PRIORITIES.map((priority) => {
              const selected = form.priority === priority;
              return (
                <button
                  key={priority}
                  type="button"
                  onClick={() => updateField('priority', priority)}
                  aria-pressed={selected}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    selected
                      ? `border-transparent ${PRIORITY_STYLES[priority]}`
                      : 'border-line bg-surface text-muted hover:bg-surface-2'
                  }`}
                >
                  {priority}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="task-status">
              Status
            </label>
            <select
              id="task-status"
              className="input"
              value={form.status}
              onChange={(event) => updateField('status', event.target.value)}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="task-due-date">
              Due date
            </label>
            <div className="relative">
              <CalendarDays
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <input
                id="task-due-date"
                className="input pl-9"
                type="date"
                value={form.dueDate}
                onChange={(event) => updateField('dueDate', event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving && <Spinner />}
            {isEditing ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
