import { useState } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
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
          <NavLink
            to="/guide"
            className={({ isActive }) =>
              `transition hover:text-slate-900 ${isActive ? 'text-brand' : ''}`
            }
          >
            Guide
          </NavLink>
        </nav>

        <div className="hidden items-center gap-3 text-sm font-semibold md:flex">
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

        <button
          type="button"
          className="md:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6 text-slate-700"
          >
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute inset-x-4 top-[calc(100%+0.5rem)] rounded-3xl border border-slate-100 bg-white p-4 shadow-xl md:hidden">
            <nav className="flex flex-col gap-3 text-sm font-semibold text-slate-600">
              {[...marketingLinks, { to: '/guide', label: 'Guide' }].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `rounded-2xl px-3 py-2 transition ${isActive ? 'bg-brand/10 text-brand' : 'hover:bg-slate-50'}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              {user ? (
                <Link
                  to="/dashboard"
                  onClick={closeMenu}
                  className="rounded-2xl bg-brand px-3 py-2 text-center text-white"
                >
                  Go to app
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="rounded-2xl border border-slate-200 px-3 py-2 text-center text-slate-700"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={closeMenu}
                    className="rounded-2xl bg-slate-900 px-3 py-2 text-center text-white"
                  >
                    Start free trial
                  </Link>
                </>
              )}
            </nav>
            <p className="mt-3 text-xs text-slate-500">
              Need help? Read the <Link to="/guide" onClick={closeMenu} className="text-brand underline">quick start guide</Link>.
            </p>
          </div>
        )}
      </div>
    </header>
  );
};

