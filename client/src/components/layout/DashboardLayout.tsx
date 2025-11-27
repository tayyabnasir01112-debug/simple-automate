import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';

const navLinks = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/contacts', label: 'Contacts' },
  { to: '/pipelines', label: 'Pipelines' },
  { to: '/automations', label: 'Automations' },
  { to: '/campaigns', label: 'Campaigns' },
  { to: '/templates', label: 'Templates' },
  { to: '/settings', label: 'Settings' },
];

export const DashboardLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white/90 p-6 lg:flex">
        <Link to="/" className="mb-6 text-lg font-semibold text-slate-900">
          SimpleAutomate
        </Link>
        <nav className="flex flex-1 flex-col gap-1 text-sm">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 font-medium transition ${
                  isActive ? 'bg-brand/10 text-brand' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={logout}
          className="mt-6 rounded-md border border-slate-200 px-3 py-2 text-left text-sm font-semibold text-slate-600 transition hover:border-brand hover:text-brand"
        >
          Log out
        </button>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Workspace</p>
            <p className="font-semibold">{user?.email}</p>
          </div>
          <div className="text-xs font-semibold uppercase tracking-wide text-brand">
            {user?.subscriptionStatus ?? 'trial'}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-8 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

