import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

import Alert from '../components/Alert';
import { Spinner } from '../components/Loader';
import PasswordInput from '../components/PasswordInput';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../layouts/AuthLayout';
import { getApiError } from '../services/api';
import { getFirstName } from '../utils/format';
import { PASSWORD_MESSAGE, validateAuth } from '../utils/validation';

const INITIAL_FORM = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function Register() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setServerError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateAuth(form, true);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setServerError('');

    try {
      const user = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      toast.success(`Welcome to TaskFlow, ${getFirstName(user.name)}!`);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const message = getApiError(error, 'Unable to create your account');
      setServerError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="A calmer, clearer way to run your day starts here."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {serverError && <Alert>{serverError}</Alert>}

        <div>
          <label className="label" htmlFor="register-name">
            Full name
          </label>
          <input
            id="register-name"
            type="text"
            className="input"
            placeholder="Alex Morgan"
            autoComplete="name"
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div>
          <label className="label" htmlFor="register-email">
            Email address
          </label>
          <input
            id="register-email"
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
          id="register-password"
          label="Password"
          value={form.password}
          onChange={(event) => updateField('password', event.target.value)}
          error={errors.password}
          hint={PASSWORD_MESSAGE}
          autoComplete="new-password"
        />

        <PasswordInput
          id="register-confirm"
          label="Confirm password"
          value={form.confirmPassword}
          onChange={(event) => updateField('confirmPassword', event.target.value)}
          error={errors.confirmPassword}
          autoComplete="new-password"
          placeholder="Repeat your password"
        />

        <button type="submit" className="btn btn-primary w-full py-3" disabled={submitting}>
          {submitting && <Spinner />}
          {submitting ? 'Creating account...' : 'Create account'}
        </button>

        <p className="text-center text-xs text-muted">
          By creating an account you agree to keep your credentials private and secure.
        </p>
      </form>
    </AuthLayout>
  );
}
