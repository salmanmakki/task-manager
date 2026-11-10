import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Layers,
  LayoutDashboard,
  ListTodo,
  Moon,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import Logo from '../components/Logo';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const CURRENT_YEAR = new Date().getFullYear();

const FEATURES = [
  {
    icon: ListTodo,
    title: 'Task management',
    description: 'Create, edit and complete tasks with everything that matters attached to them.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Priorities and statuses',
    description: 'Low, Medium or High. Pending, In Progress or Completed. Your workflow, encoded.',
  },
  {
    icon: Search,
    title: 'Search and filters',
    description: 'Find any task instantly and slice your list by status, priority or due date.',
  },
  {
    icon: BarChart3,
    title: 'Live dashboard',
    description: 'Totals, completion rate and workload distribution calculated from your real data.',
  },
  {
    icon: Moon,
    title: 'Light and dark themes',
    description: 'A considered interface in both themes, with your preference remembered.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure by default',
    description: 'Hashed passwords, httpOnly JWT sessions and strict per-user data isolation.',
  },
];

const BENEFITS = [
  {
    title: 'Start the day with clarity',
    description: 'See what is due, what is moving and what is done the moment you sign in.',
  },
  {
    title: 'Spend less time deciding',
    description: 'Priorities and statuses remove the guesswork from what to pick up next.',
  },
  {
    title: 'Finish what you start',
    description: 'A visible completion rate keeps momentum honest and progress measurable.',
  },
];

function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none" aria-hidden="true">
      <div
        className="absolute -inset-6 -z-10 rounded-[2rem] bg-linear-to-tr from-indigo-500/20 via-sky-400/10 to-transparent blur-2xl"
      />
      <div className="card overflow-hidden p-0 shadow-lift">
        <div className="flex items-center gap-2 border-b border-line bg-surface-2/60 px-4 py-3">
          <span className="size-2.5 rounded-full bg-danger/70" />
          <span className="size-2.5 rounded-full bg-warning/70" />
          <span className="size-2.5 rounded-full bg-success/70" />
          <div className="mx-auto flex h-6 w-44 items-center justify-center rounded-md border border-line bg-surface text-[10px] text-muted">
            app.taskflow.com
          </div>
        </div>

        <div className="grid grid-cols-[112px_1fr] sm:grid-cols-[136px_1fr]">
          <div className="border-r border-line bg-surface-2/40 p-3">
            <div className="mb-4 flex items-center gap-1.5">
              <span className="grid size-6 place-items-center rounded-lg bg-linear-to-br from-indigo-500 to-indigo-700 text-white">
                <CheckCircle2 className="size-3.5" strokeWidth={3} />
              </span>
              <span className="text-[11px] font-bold">TaskFlow</span>
            </div>
            <div className="space-y-1">
              {[
                ['Overview', true],
                ['My Tasks', false],
                ['Completed', false],
                ['Settings', false],
              ].map(([label, active]) => (
                <div
                  key={label}
                  className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[10px] font-medium ${
                    active ? 'bg-brand-soft text-brand' : 'text-muted'
                  }`}
                >
                  <span className={`size-1.5 rounded-full ${active ? 'bg-brand' : 'bg-line'}`} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold">Overview</div>
                <div className="text-[9px] text-muted">Tuesday, November 10</div>
              </div>
              <div className="h-6 w-16 rounded-md bg-brand text-center text-[9px] font-semibold leading-6 text-white">
                New task
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {[
                ['Total', '24', 'text-ink'],
                ['Pending', '9', 'text-warning'],
                ['In progress', '5', 'text-brand'],
                ['Completed', '10', 'text-success'],
              ].map(([label, value, tone]) => (
                <div key={label} className="rounded-lg border border-line bg-surface p-1.5 sm:p-2">
                  <div className="text-[8px] text-muted">{label}</div>
                  <div className={`text-sm font-bold ${tone}`}>{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-[1.4fr_1fr]">
              <div className="rounded-lg border border-line bg-surface p-2">
                <div className="mb-2 text-[9px] font-semibold">Recent tasks</div>
                <div className="space-y-1.5">
                  {[
                    ['Prepare sprint plan', 'High', 'bg-danger'],
                    ['Review design tokens', 'Medium', 'bg-warning'],
                    ['Ship settings page', 'Low', 'bg-success'],
                  ].map(([title, priority, color]) => (
                    <div key={title} className="flex items-center gap-1.5 rounded-md bg-surface-2/60 px-1.5 py-1">
                      <span className={`size-1.5 rounded-full ${color}`} />
                      <span className="min-w-0 flex-1 truncate text-[9px] font-medium">{title}</span>
                      <span className="text-[8px] text-muted">{priority}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-line bg-surface p-2">
                <div className="mb-2 text-[9px] font-semibold">Completion</div>
                <div className="flex items-center justify-center py-1">
                  <div
                    className="grid size-16 place-items-center rounded-full"
                    style={{
                      background:
                        'conic-gradient(var(--tf-brand) 68%, var(--tf-line) 0)',
                    }}
                  >
                    <div className="grid size-12 place-items-center rounded-full bg-surface text-[11px] font-bold">
                      68%
                    </div>
                  </div>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full w-[68%] rounded-full bg-brand" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 -left-3 flex animate-float items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 shadow-lift sm:-left-6">
        <span className="grid size-7 place-items-center rounded-lg bg-success-soft text-success">
          <CheckCircle2 className="size-4" />
        </span>
        <div>
          <p className="text-[10px] font-semibold">Task completed</p>
          <p className="text-[9px] text-muted">Progress updated live</p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-dvh bg-app">
      <Navbar />

      <main>
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-linear-to-br from-indigo-500/15 via-sky-400/10 to-transparent blur-3xl"
            aria-hidden="true"
          />

          <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-8 lg:pb-28 lg:pt-20">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-brand shadow-soft">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Task management, simplified
              </span>

              <h1 className="mt-5 text-balance text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                Organize your work.
                <br />
                <span className="bg-linear-to-r from-indigo-500 to-sky-500 bg-clip-text text-transparent">
                  Take control of your day.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
                TaskFlow is a focused workspace for everything you need to get done. Plan with
                priorities, track progress with a live dashboard, and finish the day knowing
                exactly where you stand.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to={user ? '/dashboard' : '/register'} className="btn btn-primary px-6 py-3">
                  {user ? 'Open your dashboard' : 'Get started free'}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link to={user ? '/tasks' : '/login'} className="btn btn-secondary px-6 py-3">
                  {user ? 'View your tasks' : 'Sign in to TaskFlow'}
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
                  Free to get started
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-success" aria-hidden="true" />
                  Private, per-user data
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="size-4 text-success" aria-hidden="true" />
                  Fast and responsive
                </span>
              </div>
            </div>

            <div className="animate-fade-up [animation-delay:120ms]">
              <DashboardPreview />
            </div>
          </div>
        </section>

        <section id="features" className="border-t border-line bg-surface/50 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                Features
              </p>
              <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need. Nothing you don&apos;t.
              </h2>
              <p className="mt-4 text-muted">
                A deliberately small set of tools that work together, so your task list stays
                useful instead of becoming another chore.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="card p-6 transition duration-200 hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-semibold tracking-tight">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="benefits" className="py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                Benefits
              </p>
              <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
                Built for the way you actually work.
              </h2>
              <p className="mt-4 max-w-xl text-muted">
                No kanban ceremonies, no configuration maze. TaskFlow gives you a clean view of
                your work and the signals that keep it moving.
              </p>

              <div className="mt-8 space-y-4">
                {BENEFITS.map(({ title, description }) => (
                  <div key={title} className="flex gap-3.5">
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-success-soft text-success">
                      <CheckCircle2 className="size-4" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold">{title}</h3>
                      <p className="mt-0.5 text-sm text-muted">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="card p-6 sm:mt-8">
                <Layers className="size-6 text-brand" aria-hidden="true" />
                <p className="mt-4 text-3xl font-bold tracking-tight tabular-nums">3</p>
                <p className="mt-1 text-sm font-medium">Workflow states</p>
                <p className="mt-1 text-xs text-muted">
                  Pending, In Progress and Completed keep the list honest.
                </p>
              </div>
              <div className="card p-6">
                <LayoutDashboard className="size-6 text-brand" aria-hidden="true" />
                <p className="mt-4 text-3xl font-bold tracking-tight tabular-nums">1</p>
                <p className="mt-1 text-sm font-medium">Unified overview</p>
                <p className="mt-1 text-xs text-muted">
                  Your workload, progress and priorities in a single glance.
                </p>
              </div>
              <div className="card p-6 sm:col-span-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">Your data stays yours</p>
                    <p className="mt-1 text-sm text-muted">
                      Every task is scoped to your account on the server, not just hidden in the
                      interface.
                    </p>
                  </div>
                  <ShieldCheck className="size-8 shrink-0 text-success" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] bg-slate-950 px-6 py-14 text-center shadow-lift sm:px-10 sm:py-16">
            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to take control of your day?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-300">
              Create your free account and turn a scattered list into a clear plan.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to={user ? '/dashboard' : '/register'}
                className="btn btn-primary px-6 py-3"
              >
                {user ? 'Go to dashboard' : 'Create your account'}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link to="/login" className="btn btn-secondary px-6 py-3">
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-surface/50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
          <div>
            <Logo />
            <p className="mt-3 max-w-sm text-sm text-muted">
              A focused task manager for people who want their work organized, not their attention
              fragmented.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Product</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href="#features" className="text-muted transition hover:text-ink">
                  Features
                </a>
              </li>
              <li>
                <a href="#benefits" className="text-muted transition hover:text-ink">
                  Benefits
                </a>
              </li>
              <li>
                <Link to="/register" className="text-muted transition hover:text-ink">
                  Get started
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Account</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/login" className="text-muted transition hover:text-ink">
                  Log in
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-muted transition hover:text-ink">
                  Create account
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-muted transition hover:text-ink">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-line">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted sm:flex-row sm:px-6 lg:px-8">
            <p>© {CURRENT_YEAR} TaskFlow. All rights reserved.</p>
            <p>Built with the MERN stack.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
