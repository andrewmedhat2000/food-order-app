import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout';
import { Navbar } from '../components/Navbar';
import { getApiErrorMessage } from '../services/api';
import { login, register } from '../services/foodService';
import { useAuthStore } from '../store/authStore';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(email, password);
      setAuth(data.token, data.user);
      navigate(data.user.role === 'admin' ? '/admin' : '/menu');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid email or password'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <Navbar />
      <main className="mx-auto max-w-md px-4 py-10">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold">{t('login')}</h1>
          <input
            type="email"
            placeholder={t('email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder={t('password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border px-3 py-2"
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-500 py-3 font-semibold text-white hover:bg-brand-600"
          >
            {loading ? t('processing') : t('login')}
          </button>
          <p className="text-sm text-slate-500">{t('adminLoginHint')}</p>
          <p className="text-sm">
            <Link to="/register" className="text-brand-600 hover:underline">
              {t('register')}
            </Link>
          </p>
        </form>
      </main>
    </Layout>
  );
}

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await register(name, email, password);
      setAuth(data.token, data.user);
      navigate('/menu');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <Navbar />
      <main className="mx-auto max-w-md px-4 py-10">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold">{t('register')}</h1>
          <input
            placeholder={t('name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border px-3 py-2"
            required
          />
          <input
            type="email"
            placeholder={t('email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder={t('password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border px-3 py-2"
            required
            minLength={6}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-500 py-3 font-semibold text-white hover:bg-brand-600"
          >
            {loading ? t('processing') : t('register')}
          </button>
        </form>
      </main>
    </Layout>
  );
}
