import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/Navbar';
import { Layout } from '../components/Layout';

export function HomePage() {
  const { t } = useTranslation();

  return (
    <Layout>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-16">
        <section className="rounded-3xl bg-white p-10 shadow-sm ring-1 ring-orange-100">
          <h1 className="max-w-2xl text-4xl font-black text-slate-900 sm:text-5xl">{t('heroTitle')}</h1>
          <p className="mt-4 max-w-xl text-lg text-slate-600">{t('heroSubtitle')}</p>
          <Link
            to="/menu"
            className="mt-8 inline-block rounded-2xl bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600"
          >
            {t('browseMenu')}
          </Link>
        </section>
      </main>
    </Layout>
  );
}
