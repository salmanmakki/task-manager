import { useState } from 'react';
import { LogOut, Moon, Palette, ShieldCheck, Sun, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import Alert from '../components/Alert';
import { Spinner } from '../components/Loader';
import PasswordInput from '../components/PasswordInput';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getApiError } from '../services/api';
import { formatDate, getInitials } from '../utils/format';
import { validatePasswordChange, validateProfile } from '../utils/validation';

const EMPTY_PASSWORDS = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

function SettingsCard({ icon: Icon, title, description, children }) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-semibold tracking-tight">{title}</h2>
          <p className="mt-0.5 text-sm text-muted">{description}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function Settings() {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileServerError, setProfileServerError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState(EMPTY_PASSWORDS);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordServerError, setPasswordServerError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const updateProfileField = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setProfileErrors((current) => ({ ...current, [field]: undefined }));
    setProfileServerError('');
  };

  const updatePasswordField = (field, value) => {
    setPasswords((current) => ({ ...current, [field]: value }));
    setPasswordErrors((current) => ({ ...current, [field]: undefined }));
    setPasswordServerError('');
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateProfile(profile);
    if (Object.keys(nextErrors).length > 0) {
      setProfileErrors(nextErrors);
      return;
    }

    setSavingProfile(true);
    setProfileServerError('');

    try {
      const updated = await updateProfile({
        name: profile.name.trim(),
        email: profile.email.trim(),
      });
      setProfile({ name: updated.name, email: updated.email });
      toast.success('Profile updated');
    } catch (error) {
      const message = getApiError(error, 'Unable to update your profile');
      setProfileServerError(message);
      toast.error(message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validatePasswordChange(passwords);
    if (Object.keys(nextErrors).length > 0) {
      setPasswordErrors(nextErrors);
      return;
    }

    setSavingPassword(true);
    setPasswordServerError('');

    try {
      await changePassword(passwords);
      toast.success('Password updated');
      setPasswords(EMPTY_PASSWORDS);
      setPasswordErrors({});
    } catch (error) {
      const message = getApiError(error, 'Unable to change your password');
      setPasswordServerError(message);
      toast.error(message);
    } finally {
      setSavingPassword(false);
    }
  };

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
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Manage your profile, security and appearance preferences.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SettingsCard
          icon={UserRound}
          title="Profile"
          description="Your name and email appear across your workspace."
        >
          <div className="mb-5 flex items-center gap-3 rounded-xl bg-surface-2/60 p-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-linear-to-br from-indigo-500 to-indigo-700 text-sm font-bold text-white">
              {getInitials(user?.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user?.name}</p>
              <p className="truncate text-xs text-muted">Member since {formatDate(user?.createdAt)}</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4" noValidate>
            {profileServerError && <Alert>{profileServerError}</Alert>}

            <div>
              <label className="label" htmlFor="settings-name">
                Full name
              </label>
              <input
                id="settings-name"
                type="text"
                className="input"
                value={profile.name}
                onChange={(event) => updateProfileField('name', event.target.value)}
                autoComplete="name"
              />
              {profileErrors.name && <p className="field-error">{profileErrors.name}</p>}
            </div>

            <div>
              <label className="label" htmlFor="settings-email">
                Email address
              </label>
              <input
                id="settings-email"
                type="email"
                className="input"
                value={profile.email}
                onChange={(event) => updateProfileField('email', event.target.value)}
                autoComplete="email"
              />
              {profileErrors.email && <p className="field-error">{profileErrors.email}</p>}
            </div>

            <button type="submit" className="btn btn-primary" disabled={savingProfile}>
              {savingProfile && <Spinner />}
              Save profile
            </button>
          </form>
        </SettingsCard>

        <SettingsCard
          icon={ShieldCheck}
          title="Password"
          description="Use a strong, unique password you don't use elsewhere."
        >
          <form onSubmit={handlePasswordSubmit} className="space-y-4" noValidate>
            {passwordServerError && <Alert>{passwordServerError}</Alert>}

            <PasswordInput
              id="current-password"
              label="Current password"
              value={passwords.currentPassword}
              onChange={(event) => updatePasswordField('currentPassword', event.target.value)}
              error={passwordErrors.currentPassword}
              autoComplete="current-password"
            />

            <PasswordInput
              id="new-password"
              label="New password"
              value={passwords.newPassword}
              onChange={(event) => updatePasswordField('newPassword', event.target.value)}
              error={passwordErrors.newPassword}
              hint="At least 8 characters, including a letter and a number"
              autoComplete="new-password"
            />

            <PasswordInput
              id="confirm-new-password"
              label="Confirm new password"
              value={passwords.confirmPassword}
              onChange={(event) => updatePasswordField('confirmPassword', event.target.value)}
              error={passwordErrors.confirmPassword}
              autoComplete="new-password"
              placeholder="Repeat your new password"
            />

            <button type="submit" className="btn btn-primary" disabled={savingPassword}>
              {savingPassword && <Spinner />}
              Update password
            </button>
          </form>
        </SettingsCard>

        <SettingsCard
          icon={Palette}
          title="Appearance"
          description="Choose how TaskFlow looks on this device."
        >
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTheme('light')}
              aria-pressed={theme === 'light'}
              className={`rounded-xl border p-3 text-left transition ${
                theme === 'light'
                  ? 'border-brand bg-brand-soft ring-2 ring-brand/20'
                  : 'border-line bg-surface hover:bg-surface-2'
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Sun className="size-4" aria-hidden="true" />
                Light
              </span>
              <span className="mt-2 block h-10 rounded-lg border border-slate-200 bg-slate-50 p-1.5">
                <span className="block h-2 w-2/3 rounded-full bg-slate-300" />
                <span className="mt-1 block h-2 w-1/2 rounded-full bg-slate-200" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              aria-pressed={theme === 'dark'}
              className={`rounded-xl border p-3 text-left transition ${
                theme === 'dark'
                  ? 'border-brand bg-brand-soft ring-2 ring-brand/20'
                  : 'border-line bg-surface hover:bg-surface-2'
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Moon className="size-4" aria-hidden="true" />
                Dark
              </span>
              <span className="mt-2 block h-10 rounded-lg border border-slate-700 bg-slate-900 p-1.5">
                <span className="block h-2 w-2/3 rounded-full bg-slate-600" />
                <span className="mt-1 block h-2 w-1/2 rounded-full bg-slate-700" />
              </span>
            </button>
          </div>
          <p className="mt-3 text-xs text-muted">
            Your preference is saved locally and applied before the app renders, so there is no
            flash of the wrong theme.
          </p>
        </SettingsCard>

        <SettingsCard
          icon={LogOut}
          title="Session"
          description="Sign out of TaskFlow on this device."
        >
          <div className="rounded-xl border border-line bg-surface-2/50 p-3.5">
            <p className="text-sm font-medium">Signed in as</p>
            <p className="truncate text-sm text-muted">{user?.email}</p>
          </div>
          <button type="button" className="btn btn-secondary mt-4 w-full" onClick={handleLogout}>
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
        </SettingsCard>
      </div>
    </div>
  );
}
