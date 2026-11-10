const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

export const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDateShort = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

export const formatDueDate = (value) => {
  if (!value) return 'No due date';

  const today = startOfDay(new Date());
  const target = startOfDay(new Date(value));
  const diff = Math.round((target.getTime() - today.getTime()) / DAY_MS);

  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  if (diff === -1) return 'Due yesterday';
  if (diff < -1 && diff >= -6) return `Overdue by ${Math.abs(diff)} days`;

  const sameYear = target.getFullYear() === today.getFullYear();
  const label = target.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  });

  return `Due ${label}`;
};

export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'Completed') return false;
  return new Date(dueDate).getTime() < startOfDay(new Date()).getTime();
};

export const toDateInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (number) => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'TC';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export const getFirstName = (name = '') => name.trim().split(/\s+/)[0] || 'there';

export const formatToday = () =>
  new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
