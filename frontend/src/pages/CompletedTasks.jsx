import { useEffect, useState } from 'react';
import { CheckCircle2, RefreshCw, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

import Alert from '../components/Alert';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { TaskGridSkeleton } from '../components/Skeleton';
import TaskCard from '../components/TaskCard';
import { getApiError } from '../services/api';
import {
  deleteTaskRequest,
  fetchTasks,
  updateTaskStatusRequest,
} from '../services/taskService';

export default function CompletedTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const reload = () => setReloadKey((key) => key + 1);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    fetchTasks({ status: 'Completed', sort: 'createdAt_desc' })
      .then((data) => {
        if (active) setTasks(data.tasks);
      })
      .catch((fetchError) => {
        if (active) setError(getApiError(fetchError, 'Unable to load completed tasks'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const handleRestore = async (task) => {
    setBusyId(task._id);
    try {
      await updateTaskStatusRequest(task._id, 'Pending');
      toast.success('Task restored to Pending');
      reload();
    } catch (restoreError) {
      toast.error(getApiError(restoreError, 'Unable to restore the task'));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTaskRequest(deleteTarget._id);
      toast.success('Task deleted');
      setDeleteTarget(null);
      reload();
    } catch (deleteError) {
      toast.error(getApiError(deleteError, 'Unable to delete the task'));
    } finally {
      setDeleting(false);
    }
  };

  const term = search.trim().toLowerCase();
  const visibleTasks = term
    ? tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(term) ||
          (task.description || '').toLowerCase().includes(term)
      )
    : tasks;

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Completed</h1>
          <p className="mt-1 text-sm text-muted">
            A record of what you have shipped. Restore a task if it needs another pass.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2 text-sm text-muted">
          <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
          {loading ? 'Loading...' : `${visibleTasks.length} completed`}
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="card p-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              className="input pl-9 pr-9"
              placeholder="Search completed tasks..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search completed tasks"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="icon-btn absolute right-1 top-1/2 size-8 -translate-y-1/2"
                aria-label="Clear search"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <Alert className="flex-col sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={reload}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold underline sm:mt-0"
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            Retry
          </button>
        </Alert>
      )}

      {loading ? (
        <TaskGridSkeleton count={4} />
      ) : visibleTasks.length === 0 ? (
        search ? (
          <EmptyState
            icon={Search}
            title="No completed tasks match"
            description="Try a different search term to find what you are looking for."
            action={
              <button type="button" className="btn btn-secondary" onClick={() => setSearch('')}>
                Clear search
              </button>
            }
          />
        ) : (
          <EmptyState
            icon={CheckCircle2}
            title="Nothing completed yet"
            description="Completed tasks will collect here as you finish them. Keep going."
            action={
              <Link to="/tasks" className="btn btn-primary">
                Go to My Tasks
              </Link>
            }
          />
        )
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibleTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onDelete={setDeleteTarget}
              onStatusChange={handleRestore}
              busy={busyId === task._id}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this completed task?"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" will be permanently removed. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete task"
        busy={deleting}
        onConfirm={handleDelete}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
