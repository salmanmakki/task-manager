import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import Alert from '../components/Alert';
import { Spinner } from '../components/Loader';
import PasswordInput from '../components/PasswordInput';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../layouts/AuthLayout';
import { getApiError } from '../services/api';
import { getFirstName } from '../utils/format';
import { validateAuth } from '../utils/validation';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setServerError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateAuth(
      { email: form.email, password: form.password },
      false
    );

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setServerError('');

    try {
      const user = await login({ email: form.email.trim(), password: form.password });
      toast.success(`Welcome back, ${getFirstName(user.name)}`);
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (error) {
      const message = getApiError(error, 'Unable to sign in');
      setServerError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to pick up exactly where you left off."
      footer={
        <>
          New to TaskFlow?{' '}
          <Link to="/register" className="font-semibold text-brand hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {serverError && <Alert>{serverError}</Alert>}

        <div>
          <label className="label" htmlFor="login-email">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            className="input"
            placeholder="you@example.com"
            autoComplete="email"
            value={form.email}
            onChange={(event) => updateField('email', event.target.value)}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <PasswordInput
          id="login-password"
          label="Password"
          value={form.password}
          onChange={(event) => updateField('password', event.target.value)}
          error={errors.password}
          autoComplete="current-password"
        />

        <button type="submit" className="btn btn-primary w-full py-3" disabled={submitting}>
          {submitting && <Spinner />}
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  );
}
