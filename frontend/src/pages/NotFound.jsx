import { ArrowLeft, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const { user } = useAuth();

  return (
    <div className="grid min-h-dvh place-items-center bg-app px-6">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center">
          <Logo />
        </div>
        <span className="mx-auto mt-8 grid size-16 place-items-center rounded-2xl bg-brand-soft text-brand">
          <Compass className="size-8" aria-hidden="true" />
        </span>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-brand">404</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          This page went off the list.
        </h1>
        <p className="mt-3 text-sm text-muted">
          The page you are looking for doesn&apos;t exist or may have been moved.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <Link to={user ? '/dashboard' : '/'} className="btn btn-primary">
            <ArrowLeft className="size-4" aria-hidden="true" />
            {user ? 'Back to dashboard' : 'Back to home'}
          </Link>
          {!user && (
            <Link to="/login" className="btn btn-secondary">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
