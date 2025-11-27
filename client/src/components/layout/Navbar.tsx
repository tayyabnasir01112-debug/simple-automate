import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import logo from '../../assets/logo.svg';

const marketingLinks = [
  { to: '/features/crm', label: 'CRM' },
  { to: '/features/automation', label: 'Automation' },
  { to: '/features/email-marketing', label: 'Email' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
];

export const Navbar = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <img src={logo} alt="SimpleAutomate logo" className="h-9 w-9 rounded-full border border-slate-200 bg-white p-1" />
          <span>SimpleAutomate</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {marketingLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `transition hover:text-slate-900 ${isActive ? 'text-brand' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-sm font-semibold">
          {user ? (
            <Link
              to="/dashboard"
              className="rounded-full border border-slate-200 px-4 py-2 text-slate-700 transition hover:border-brand hover:text-brand"
            >
              Go to app
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-slate-600 hover:text-slate-900">
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-brand px-4 py-2 text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark"
              >
                Start free trial
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

