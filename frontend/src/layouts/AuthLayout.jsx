import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';

const CURRENT_YEAR = new Date().getFullYear();

const HIGHLIGHTS = [
  'Every commitment in one focused workspace',
  'Priorities, statuses and deadlines that stay current',
  'Private to your account, secured with JWT sessions',
];

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-10 lg:flex">
        <div
          className="pointer-events-none absolute -left-24 top-1/4 size-96 rounded-full bg-indigo-600/30 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 right-0 size-96 rounded-full bg-sky-500/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative">
          <Logo inverted />
        </div>

        <div className="relative max-w-md animate-fade-up">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-white">
            Focus on the work that matters.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-300">
            TaskFlow keeps your tasks, priorities and progress in one calm, organized place — so
            your day runs on purpose, not on noise.
          </p>
          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-slate-200">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-indigo-400" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">
          © {CURRENT_YEAR} TaskFlow. Built for focused work.
        </p>
      </div>

      <div className="flex flex-col bg-app">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:justify-end">
          <Logo className="lg:hidden" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/" className="btn btn-ghost btn-sm">
              Back to home
            </Link>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-md animate-fade-up">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
            <p className="mt-2 text-sm text-muted">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
