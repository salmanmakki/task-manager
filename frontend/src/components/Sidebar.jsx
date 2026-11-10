import {
  CheckCircle2,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Settings,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { NavLink, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/format';
import Logo from './Logo';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/tasks', label: 'My Tasks', icon: ListTodo },
  { to: '/completed', label: 'Completed', icon: CheckCircle2 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Local session is cleared even if the server call fails.
    }
    toast.success('Signed out');
    navigate('/', { replace: true });
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-surface transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
      aria-label="Sidebar"
    >
      <div className="flex h-16 items-center justify-between border-b border-line px-5">
        <Logo />
        <button type="button" className="icon-btn lg:hidden" onClick={onClose} aria-label="Close sidebar">
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-widest text-muted">
          Workspace
        </p>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
            }
          >
            <Icon className="size-4.5" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-line p-3">
        <NavLink
          to="/settings"
          onClick={onClose}
          className="mb-1 flex items-center gap-3 rounded-xl p-2 transition hover:bg-surface-2"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand/10 text-xs font-bold text-brand">
            {getInitials(user?.name)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">{user?.name}</span>
            <span className="block truncate text-xs text-muted">{user?.email}</span>
          </span>
        </NavLink>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-danger-soft hover:text-danger"
        >
          <LogOut className="size-4.5" aria-hidden="true" />
          Log out
        </button>
      </div>
    </aside>
  );
}
