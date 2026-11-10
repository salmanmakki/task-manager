import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  ListTodo,
  LoaderCircle,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import { DashboardSkeleton } from '../components/Skeleton';
import StatCard from '../components/StatCard';
import { fetchTaskStats } from '../services/taskService';
import { getApiError } from '../services/api';
import {
  PRIORITIES,
  PRIORITY_BARS,
  PRIORITY_DOTS,
  STATUS_STYLES,
} from '../utils/constants';
import { formatDueDate } from '../utils/format';

function MiniTaskRow({ task }) {
  return (
    <Link
      to="/tasks"
      className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-2.5 transition hover:border-line hover:bg-surface-2"
    >
      <span
        className={`size-2 shrink-0 rounded-full ${PRIORITY_DOTS[task.priority]}`}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{task.title}</span>
        <span className="block text-xs text-muted">{formatDueDate(task.dueDate)}</span>
      </span>
      <span className={`badge hidden sm:inline-flex ${STATUS_STYLES[task.status]}`}>
        {task.status}
      </span>
    </Link>
  );
}

function SectionCard({ title, action, children }) {
  return (
    <section className="card p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    fetchTaskStats()
      .then((data) => {
        if (active) setStats(data);
      })
      .catch((fetchError) => {
        if (active) setError(getApiError(fetchError, 'Unable to load your dashboard'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert>{error}</Alert>
        <button type="button" className="btn btn-secondary" onClick={() => setReloadKey((key) => key + 1)}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const priorityRows = PRIORITIES.map((priority) => ({
    priority,
    count: stats.priority[priority],
    percent: stats.total === 0 ? 0 : Math.round((stats.priority[priority] / stats.total) * 100),
  }));

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Overview</h1>
          <p className="mt-1 text-sm text-muted">
            A live snapshot of your workspace, calculated from your tasks.
          </p>
        </div>
        <Link to="/tasks?new=1" className="btn btn-primary shrink-0">
          <Plus className="size-4" aria-hidden="true" />
          New task
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total tasks"
          value={stats.total}
          icon={ListTodo}
          tone="brand"
          hint={stats.overdue > 0 ? `${stats.overdue} overdue` : 'All caught up on deadlines'}
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={Clock3}
          tone="warning"
          hint="Waiting to be started"
        />
        <StatCard
          label="In progress"
          value={stats.inProgress}
          icon={LoaderCircle}
          tone="brand"
          hint="Currently moving"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={CheckCircle2}
          tone="success"
          hint={`${stats.completionRate}% completion rate`}
        />
      </div>

      {stats.total === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="Your workspace is ready"
          description="Create your first task to see your dashboard come to life with real progress."
          action={
            <Link to="/tasks?new=1" className="btn btn-primary">
              <Plus className="size-4" aria-hidden="true" />
              Create your first task
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <SectionCard
              title="Recent tasks"
              action={
                <Link to="/tasks" className="text-xs font-semibold text-brand hover:underline">
                  View all
                </Link>
              }
            >
              {stats.recentTasks.length === 0 ? (
                <p className="py-4 text-sm text-muted">No tasks yet.</p>
              ) : (
                <div className="space-y-1">
                  {stats.recentTasks.map((task) => (
                    <MiniTaskRow key={task._id} task={task} />
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Upcoming deadlines"
              action={
                <Link to="/tasks" className="text-xs font-semibold text-brand hover:underline">
                  Manage
                </Link>
              }
            >
              {stats.upcomingTasks.length === 0 ? (
                <p className="py-4 text-sm text-muted">
                  Nothing scheduled ahead. Add a due date to keep future work visible.
                </p>
              ) : (
                <div className="space-y-1">
                  {stats.upcomingTasks.map((task) => (
                    <MiniTaskRow key={task._id} task={task} />
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          <div className="space-y-4">
            <SectionCard title="Completion progress">
              <div className="flex flex-col items-center py-2">
                <div
                  className="grid size-36 place-items-center rounded-full"
                  style={{
                    background: `conic-gradient(var(--tf-brand) ${stats.completionRate}%, var(--tf-line) 0)`,
                  }}
                  role="img"
                  aria-label={`${stats.completionRate} percent complete`}
                >
                  <div className="grid size-28 place-items-center rounded-full bg-surface">
                    <span className="text-3xl font-bold tracking-tight tabular-nums">
                      {stats.completionRate}%
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-sm font-medium">
                  {stats.completed} of {stats.total} tasks completed
                </p>
                <p className="mt-1 text-xs text-muted">
                  {stats.pending + stats.inProgress} still open
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Priority distribution">
              <div className="space-y-3.5">
                {priorityRows.map(({ priority, count, percent }) => (
                  <div key={priority}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-medium">{priority}</span>
                      <span className="tabular-nums text-muted">
                        {count} · {percent}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${PRIORITY_BARS[priority]}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );
}
