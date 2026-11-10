import { Navigate, Route, Routes } from 'react-router-dom';

import GuestRoute from './components/GuestRoute';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import DashboardLayout from './layouts/DashboardLayout';
import CompletedTasks from './pages/CompletedTasks';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import MyTasks from './pages/MyTasks';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import Settings from './pages/Settings';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tasks" element={<MyTasks />} />
              <Route path="/completed" element={<CompletedTasks />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          <Route path="/app" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}
