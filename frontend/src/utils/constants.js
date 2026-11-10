export const PRIORITIES = ['Low', 'Medium', 'High'];
export const STATUSES = ['Pending', 'In Progress', 'Completed'];

export const PRIORITY_STYLES = {
  Low: 'bg-success-soft text-success',
  Medium: 'bg-warning-soft text-warning',
  High: 'bg-danger-soft text-danger',
};

export const PRIORITY_DOTS = {
  Low: 'bg-success',
  Medium: 'bg-warning',
  High: 'bg-danger',
};

export const PRIORITY_BARS = {
  Low: 'bg-success',
  Medium: 'bg-warning',
  High: 'bg-danger',
};

export const STATUS_STYLES = {
  Pending: 'bg-warning-soft text-warning',
  'In Progress': 'bg-brand-soft text-brand',
  Completed: 'bg-success-soft text-success',
};

export const STATUS_DOTS = {
  Pending: 'bg-warning',
  'In Progress': 'bg-brand',
  Completed: 'bg-success',
};

export const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Newest first' },
  { value: 'createdAt_asc', label: 'Oldest first' },
  { value: 'dueDate_asc', label: 'Due date (earliest)' },
  { value: 'dueDate_desc', label: 'Due date (latest)' },
];
