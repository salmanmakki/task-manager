import { useEffect, useState } from 'react';
import { ListTodo, Plus, RefreshCw, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

import Alert from '../components/Alert';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { TaskGridSkeleton } from '../components/Skeleton';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import useDebounce from '../hooks/useDebounce';
import { getApiError } from '../services/api';
import {
  deleteTaskRequest,
  fetchTasks,
  updateTaskStatusRequest,
} from '../services/taskService';
import { PRIORITIES, SORT_OPTIONS, STATUSES } from '../utils/constants';

const DEFAULT_SORT = 'createdAt_desc';

export default function MyTasks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [sort, setSort] = useState(DEFAULT_SORT);
  const debouncedSearch = useDebounce(search, 300);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const reload = () => setReloadKey((key) => key + 1);

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get('new') !== '1') return;
    setEditingTask(null);
    setModalOpen(true);
    const next = new URLSearchParams(searchParams);
    next.delete('new');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    fetchTasks({ search: debouncedSearch, status, priority, sort })
      .then((data) => {
        if (active) setTasks(data.tasks);
      })
      .catch((fetchError) => {
        if (active) setError(getApiError(fetchError, 'Unable to load your tasks'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [debouncedSearch, status, priority, sort, reloadKey]);

  const hasFilters =
    Boolean(search) || Boolean(status) || Boolean(priority) || sort !== DEFAULT_SORT;

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setPriority('');
    setSort(DEFAULT_SORT);
    if (searchParams.has('search')) {
      setSearchParams({}, { replace: true });
    }
  };

  const openCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleStatusChange = async (task, nextStatus) => {
    setBusyId(task._id);
    try {
      await updateTaskStatusRequest(task._id, nextStatus);
      toast.success(nextStatus === 'Completed' ? 'Task completed' : `Task moved to ${nextStatus}`);
      reload();
    } catch (statusError) {
      toast.error(getApiError(statusError, 'Unable to update the task'));
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

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My Tasks</h1>
          <p className="mt-1 text-sm text-muted">
            Everything on your plate, with the context to act on it.
          </p>
        </div>
        <button type="button" className="btn btn-primary shrink-0" onClick={openCreate}>
          <Plus className="size-4" aria-hidden="true" />
          Create task
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              className="input pl-9 pr-9"
              placeholder="Search title or description..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search tasks"
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

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <select
              className="input sm:w-40"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              {STATUSES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <select
              className="input sm:w-36"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              aria-label="Filter by priority"
            >
              <option value="">All priorities</option>
              {PRIORITIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <select
              className="input col-span-2 sm:col-span-1 sm:w-48"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              aria-label="Sort tasks"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasFilters && (
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3 text-xs text-muted">
            <span>
              {loading ? 'Searching...' : `${tasks.length} ${tasks.length === 1 ? 'result' : 'results'}`}
            </span>
            <button
              type="button"
              className="font-semibold text-brand hover:underline"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

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
      ) : tasks.length === 0 ? (
        hasFilters ? (
          <EmptyState
            icon={Search}
            title="No tasks match those filters"
            description="Try a different search term or reset the filters to see everything again."
            action={
              <button type="button" className="btn btn-secondary" onClick={clearFilters}>
                Clear filters
              </button>
            }
          />
        ) : (
          <EmptyState
            icon={ListTodo}
            title="No tasks yet"
            description="Your task list is a clean slate. Add the first thing you want to move forward."
            action={
              <button type="button" className="btn btn-primary" onClick={openCreate}>
                <Plus className="size-4" aria-hidden="true" />
                Create your first task
              </button>
            }
          />
        )
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onStatusChange={handleStatusChange}
              busy={busyId === task._id}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <TaskModal
          open={modalOpen}
          task={editingTask}
          onClose={() => setModalOpen(false)}
          onSaved={reload}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this task?"
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
