import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const HOME = { customer: '/app', driver: '/driver', admin: '/admin' };

export default function ProtectedRoute({ role }) {
  const { user } = useSelector((s) => s.auth);
  const loc = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname + loc.search }} />;
  if (user.mustChangePassword && loc.pathname !== '/change-password') return <Navigate to="/change-password" replace />;
  if (role && user.role !== role) return <Navigate to={HOME[user.role]} replace />;
  return <Outlet />;
}
