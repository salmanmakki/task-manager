import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import useClickOutside from '../hooks/useClickOutside';
import { getInitials } from '../utils/format';

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useClickOutside(menuRef, () => setOpen(false), open);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  if (!user) return null;

  const handleLogout = async () => {
    setOpen(false);
    try {
      await logout();
    } catch {
      // Local session is cleared even if the server call fails.
    }
    toast.success('Signed out');
    navigate('/', { replace: true });
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 rounded-xl p-1.5 pr-2 transition hover:bg-surface-2"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open profile menu"
      >
        <span className="grid size-8 place-items-center rounded-full bg-linear-to-br from-indigo-500 to-indigo-700 text-xs font-bold text-white">
          {getInitials(user.name)}
        </span>
        <ChevronDown
          className={`hidden size-4 text-muted transition sm:block ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 animate-scale-in rounded-xl border border-line bg-surface p-1.5 shadow-lift"
        >
          <div className="border-b border-line px-3 py-2.5">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <Link
            to="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-ink"
          >
            <Settings className="size-4" aria-hidden="true" />
            Settings
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-danger-soft hover:text-danger"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
