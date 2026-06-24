import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout';
import { Navbar } from '../components/Navbar';
import { ProductCard } from '../components/ProductCard';
import { fetchProducts } from '../services/foodService';
import { getApiErrorMessage } from '../services/api';
import { Product } from '../types';

export function MenuPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((err) => setError(getApiErrorMessage(err, 'Failed to load menu')))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="mb-8 text-3xl font-bold text-slate-900">{t('menu')}</h1>
        {loading && <p>{t('loading')}</p>}
        {error && <p className="text-red-600">{error}</p>}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </main>
    </Layout>
  );
}
