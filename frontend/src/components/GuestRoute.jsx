import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

export default function GuestRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader label="Checking your session..." />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
