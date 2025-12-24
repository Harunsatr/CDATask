import { ReactNode, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { label: 'Collections', path: '/properties' },
  { label: 'Stories', path: '/#stories' },
  { label: 'Contact', path: '/#contact' },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout, isAdmin, isMerchant } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Determine dashboard path based on role
  const getDashboardPath = () => {
    if (isAdmin) return '/admin';
    if (isMerchant) return '/merchant';
    return '/dashboard';
  };

  const getDashboardLabel = () => {
    if (isAdmin) return 'Admin Panel';
    if (isMerchant) return 'Merchant Panel';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-ivory/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-semibold tracking-[0.3em] uppercase">
            LUXE<span className="text-gold">PORTAL</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    'tracking-wide transition hover:text-gold',
                    isActive && 'text-gold underline underline-offset-8',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            {user ? (
              <div className="flex items-center gap-4">
                <Link 
                  to={getDashboardPath()} 
                  className="flex items-center gap-2 text-sm text-charcoal/80 hover:text-gold"
                >
                  <span className={clsx(
                    'inline-block rounded-full px-2 py-0.5 text-xs uppercase',
                    isAdmin && 'bg-purple-100 text-purple-700',
                    isMerchant && 'bg-blue-100 text-blue-700',
                    !isAdmin && !isMerchant && 'bg-green-100 text-green-700'
                  )}>
                    {user.role}
                  </span>
                  {user.name}
                </Link>
                <Link 
                  to={getDashboardPath()} 
                  className="text-xs text-charcoal/60 hover:text-gold"
                >
                  {getDashboardLabel()}
                </Link>
                <Button variant="ghost" onClick={logout} className="text-xs">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm text-charcoal/80 hover:text-gold">
                  Login
                </Link>
                <Button as="a" href="/register" className="text-xs">
                  Join Circle
                </Button>
              </div>
            )}
          </nav>
          <button
            type="button"
            aria-label="Open menu"
            className="md:hidden"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <span className="block h-0.5 w-6 bg-charcoal" />
            <span className="mt-1 block h-0.5 w-6 bg-charcoal" />
          </button>
        </div>
        {isOpen && (
          <div className="border-t border-platinum md:hidden">
            <div className="space-y-4 px-6 py-4">
              {navItems.map((item) => (
                <NavLink key={item.path} to={item.path} className="block text-sm" onClick={() => setIsOpen(false)}>
                  {item.label}
                </NavLink>
              ))}
              {user ? (
                <>
                  <Link 
                    to={getDashboardPath()} 
                    className="block text-sm text-charcoal/80"
                    onClick={() => setIsOpen(false)}
                  >
                    {getDashboardLabel()}
                  </Link>
                  <button type="button" onClick={logout} className="text-sm text-left text-charcoal/80">
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-4">
                  <Link to="/login" className="text-sm" onClick={() => setIsOpen(false)}>
                    Login
                  </Link>
                  <Link to="/register" className="text-sm" onClick={() => setIsOpen(false)}>
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-platinum/60 bg-white/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-charcoal/70 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} LuxePortal — Curated escapes worldwide.</p>
          <div className="flex gap-6">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <a href="mailto:concierge@luxury.test">Concierge</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
