import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LayoutDashboard, LogOut, Package, PlusCircle, Truck, User, Users, Wallet } from 'lucide-react';
import Logo from './Logo';
import { clearSession } from '../features/auth/authSlice';
import { apiSlice } from '../app/api';

const NAV = {
  customer: [
    { to: '/app', label: 'Shipments', icon: Package, end: true },
    { to: '/app/book', label: 'Book', icon: PlusCircle },
    { to: '/app/profile', label: 'Profile', icon: User },
  ],
  driver: [
    { to: '/driver', label: 'Jobs', icon: Truck, end: true },
    { to: '/driver/earnings', label: 'Earnings', icon: Wallet },
    { to: '/driver/profile', label: 'Profile', icon: User },
  ],
  admin: [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/shipments', label: 'Shipments', icon: Package },
    { to: '/admin/drivers', label: 'Drivers', icon: Truck },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/earnings', label: 'Earnings', icon: Wallet },
  ],
};

const link = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition ${isActive ? 'bg-white/10 text-white' : 'text-ink-soft hover:bg-white/5 hover:text-white'}`;
const tab = ({ isActive }) =>
  `flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${isActive ? 'text-ink' : 'text-muted'}`;

export default function AppShell() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = NAV[user.role];

  const logout = () => {
    dispatch(clearSession());
    dispatch(apiSlice.util.resetApiState()); // no data from this user survives into the next session
    navigate('/login');
  };

  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden w-64 shrink-0 flex-col bg-ink p-4 text-white md:flex">
        <Logo className="px-2 pb-6 pt-2 text-white" />
        <nav aria-label="Main" className="flex-1 space-y-1">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={link}><Icon className="size-5" aria-hidden="true" />{label}</NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 pt-4">
          <p className="truncate px-2 text-sm font-medium">{user.fullName}</p>
          <p className="truncate px-2 pb-3 text-xs capitalize text-ink-soft">{user.role}</p>
          <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] text-ink-soft hover:bg-white/5 hover:text-white"><LogOut className="size-5" aria-hidden="true" />Log out</button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line bg-white px-4 py-3 md:hidden">
          <Logo className="text-xl" />
          <button type="button" onClick={logout} aria-label="Log out" className="grid size-10 place-items-center rounded-lg hover:bg-cream"><LogOut className="size-5" /></button>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-28 sm:px-6 md:pb-10"><Outlet /></main>
        <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={tab}><Icon className="size-5" aria-hidden="true" />{label}</NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
