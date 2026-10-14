import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearSession, setUser } from './features/auth/authSlice';
import { useGetMeQuery } from './app/api';
import ProtectedRoute, { HOME } from './components/ProtectedRoute';
import AppShell from './components/AppShell';
import { Button, Spinner } from './components/ui';
import Landing from './pages/public/Landing';
import Track from './pages/public/Track';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ChangePassword from './pages/public/ChangePassword';
import Shipments from './pages/customer/Shipments';
import Book from './pages/customer/Book';
import ShipmentDetail from './pages/customer/ShipmentDetail';
import PaymentComplete from './pages/customer/PaymentComplete';
import Profile from './pages/shared/Profile';

// Driver and admin screens load only for those roles, keeping the customer bundle small on mobile data.
const Jobs = lazy(() => import('./pages/driver/Jobs'));
const JobDetail = lazy(() => import('./pages/driver/JobDetail'));
const Earnings = lazy(() => import('./pages/driver/Earnings'));
const Overview = lazy(() => import('./pages/admin/Overview'));
const AdminShipments = lazy(() => import('./pages/admin/AdminShipments'));
const Drivers = lazy(() => import('./pages/admin/Drivers'));
const Users = lazy(() => import('./pages/admin/Users'));
const AdminEarnings = lazy(() => import('./pages/admin/AdminEarnings'));

// Restores the session from a stored token before any protected screen renders.
function SessionGate({ children }) {
  const dispatch = useDispatch();
  const { token, ready } = useSelector((s) => s.auth);
  const { data, error, refetch } = useGetMeQuery(undefined, { skip: !token || ready });

  useEffect(() => { if (data?.user) dispatch(setUser(data.user)); }, [data, dispatch]);
  useEffect(() => { if (error?.status === 401 || error?.status === 403) dispatch(clearSession()); }, [error, dispatch]);

  if (ready) return children;
  if (error && error.status !== 401 && error.status !== 403) {
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center">
        <div>
          <p className="mb-4 font-display text-lg font-semibold">We could not reach Netryk.</p>
          <Button variant="dark" onClick={refetch}>Try again</Button>
        </div>
      </div>
    );
  }
  return <Spinner label="Restoring your session" />;
}

function HomeRedirect() {
  const { user } = useSelector((s) => s.auth);
  return <Navigate to={HOME[user.role]} replace />;
}

export default function App() {
  return (
    <SessionGate>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/track" element={<Track />} />
          <Route path="/track/:trackingId" element={<Track />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/payment/complete" element={<PaymentComplete />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<HomeRedirect />} />
            <Route path="/change-password" element={<ChangePassword />} />
          </Route>

          <Route element={<ProtectedRoute role="customer" />}>
            <Route element={<AppShell />}>
              <Route path="/app" element={<Shipments />} />
              <Route path="/app/book" element={<Book />} />
              <Route path="/app/shipments/:id" element={<ShipmentDetail />} />
              <Route path="/app/profile" element={<Profile />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute role="driver" />}>
            <Route element={<AppShell />}>
              <Route path="/driver" element={<Jobs />} />
              <Route path="/driver/jobs/:id" element={<JobDetail />} />
              <Route path="/driver/earnings" element={<Earnings />} />
              <Route path="/driver/profile" element={<Profile />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute role="admin" />}>
            <Route element={<AppShell />}>
              <Route path="/admin" element={<Overview />} />
              <Route path="/admin/shipments" element={<AdminShipments />} />
              <Route path="/admin/drivers" element={<Drivers />} />
              <Route path="/admin/users" element={<Users />} />
              <Route path="/admin/earnings" element={<AdminEarnings />} />
              <Route path="/admin/profile" element={<Profile />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </SessionGate>
  );
}
