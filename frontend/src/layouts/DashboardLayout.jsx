import { useState } from 'react';
import { Menu, Search } from 'lucide-react';
import { Outlet, useNavigate } from 'react-router-dom';

import ProfileMenu from '../components/ProfileMenu';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { formatToday, getFirstName } from '../utils/format';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/tasks?search=${encodeURIComponent(query)}` : '/tasks');
    setSearch('');
  };

  return (
    <div className="min-h-dvh bg-app">
      <div
        className={`fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm transition-opacity lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <div className="flex min-h-dvh">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-line bg-app/80 backdrop-blur-xl">
            <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
              <button
                type="button"
                className="icon-btn lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="size-5" aria-hidden="true" />
              </button>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">Welcome back, {getFirstName(user?.name)}</p>
                <p className="hidden text-xs text-muted sm:block">{formatToday()}</p>
              </div>

              <form onSubmit={handleSearch} className="relative hidden md:block" role="search">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="input h-10 w-52 pl-9 lg:w-72"
                  placeholder="Search tasks..."
                  aria-label="Search tasks"
                />
              </form>

              <ThemeToggle />
              <ProfileMenu />
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>

          <footer className="border-t border-line/60 px-4 py-4 text-center text-xs text-muted sm:px-6 lg:px-8">
            TaskFlow · Your workspace, in focus.
          </footer>
        </div>
      </div>
    </div>
  );
}
