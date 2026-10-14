import { Link, NavLink, Outlet } from 'react-router';
import { APP_NAME } from '../app-name';

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
          <Link to="/" className="font-semibold tracking-tight">
            {APP_NAME}
          </Link>
          <nav aria-label="Main">
            <NavLink
              to="/models"
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100 ${
                  isActive ? 'text-indigo-700' : 'text-slate-700'
                }`
              }
            >
              Models
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
