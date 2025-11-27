import { Link } from 'react-router-dom';

const footerLinks = [
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
  { to: '/contact', label: 'Contact' },
];

export const Footer = () => (
  <footer className="border-t border-slate-100 bg-slate-50">
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
      <p>© {new Date().getFullYear()} SimpleAutomate. All rights reserved.</p>
      <div className="flex items-center gap-6">
        {footerLinks.map((link) => (
          <Link key={link.to} to={link.to} className="hover:text-slate-900">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  </footer>
);

