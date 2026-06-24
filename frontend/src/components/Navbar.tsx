import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { setLanguage } from '../i18n';

export function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuthStore();
  const cartCount = useCartStore((state) => state.count());
  const navigate = useNavigate();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition ${
      isActive ? 'bg-brand-500 text-white' : 'text-slate-700 hover:bg-brand-100'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="text-xl font-bold text-brand-600">
          🍽️ {t('appName')}
        </Link>

        <nav className="flex flex-wrap items-center gap-1">
          <NavLink to="/menu" className={linkClass}>
            {t('menu')}
          </NavLink>
          <NavLink to="/cart" className={linkClass}>
            {t('cart')} {cartCount > 0 && `(${cartCount})`}
          </NavLink>
          {user && (
            <NavLink to="/orders" className={linkClass}>
              {t('orders')}
            </NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={linkClass}>
              {t('admin')}
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <select
            aria-label={t('language')}
            value={i18n.language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'ar')}
            className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
          >
            <option value="en">{t('english')}</option>
            <option value="ar">{t('arabic')}</option>
          </select>

          {user ? (
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium hover:bg-slate-200"
            >
              {t('logout')}
            </button>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-100">
                {t('login')}
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                {t('register')}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
