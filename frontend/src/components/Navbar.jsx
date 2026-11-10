import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#benefits', label: 'Benefits' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-app/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo onClick={() => setOpen(false)} />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">
              Open dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="icon-btn md:hidden"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-line bg-surface px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
            <ThemeToggle />
            {user ? (
              <Link to="/dashboard" className="btn btn-primary flex-1">
                Open dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary flex-1">
                  Log in
                </Link>
                <Link to="/register" className="btn btn-primary flex-1">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
