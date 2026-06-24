import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout';
import { Navbar } from '../components/Navbar';
import {
  createProduct,
  deleteProduct,
  fetchAllOrders,
  fetchAllProducts,
  fetchDashboardStats,
  updateOrderStatus,
  updateProduct,
} from '../services/foodService';
import { getApiErrorMessage } from '../services/api';
import { DashboardStats, Order, Product, User } from '../types';

const emptyProduct: Partial<Product> = {
  name: '',
  nameAr: '',
  description: '',
  descriptionAr: '',
  price: 0,
  image: '',
  category: '',
  categoryAr: '',
  isAvailable: true,
};

export function AdminPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'dashboard' | 'products' | 'orders'>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState<Partial<Product>>(emptyProduct);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState('');

  async function loadAll() {
    setLoading(true);
    const [statsData, productsData, ordersData] = await Promise.all([
      fetchDashboardStats(),
      fetchAllProducts(),
      fetchAllOrders(),
    ]);
    setStats(statsData);
    setProducts(productsData);
    setOrders(ordersData);
    setLoading(false);
  }

  useEffect(() => {
    loadAll().catch(console.error);
  }, []);

  async function handleProductSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');

    try {
      if (editingId) {
        await updateProduct(editingId, form);
      } else {
        await createProduct(form);
      }
      setForm(emptyProduct);
      setEditingId(null);
      await loadAll();
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Failed to save product'));
    }
  }

  function startEdit(product: Product) {
    setEditingId(product._id);
    setForm(product);
    setTab('products');
  }

  return (
    <Layout>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="mb-6 text-3xl font-bold">{t('admin')}</h1>

        <div className="mb-6 flex flex-wrap gap-2">
          {(['dashboard', 'products', 'orders'] as const).map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                tab === item ? 'bg-brand-500 text-white' : 'bg-white text-slate-700 ring-1 ring-orange-100'
              }`}
            >
              {t(item === 'dashboard' ? 'dashboard' : item === 'products' ? 'products' : 'manageOrders')}
            </button>
          ))}
        </div>

        {loading && <p>{t('loading')}</p>}

        {!loading && tab === 'dashboard' && stats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label={t('totalOrders')} value={stats.totalOrders} />
            <StatCard label={t('pendingOrders')} value={stats.pendingOrders} />
            <StatCard label={t('products')} value={stats.totalProducts} />
            <StatCard label={t('revenue')} value={`$${stats.totalRevenue.toFixed(2)}`} />
          </div>
        )}

        {!loading && tab === 'products' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <form onSubmit={handleProductSubmit} className="space-y-3 rounded-2xl border bg-white p-5">
              <h2 className="font-bold">{editingId ? t('editProduct') : t('addProduct')}</h2>
              {formError && <p className="text-sm text-red-600">{formError}</p>}
              {(['name', 'nameAr', 'description', 'descriptionAr', 'image', 'category', 'categoryAr'] as const).map(
                (field) => (
                  <input
                    key={field}
                    placeholder={field}
                    value={String(form[field] ?? '')}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="w-full rounded-xl border px-3 py-2"
                    required={field !== 'description' && field !== 'descriptionAr'}
                  />
                )
              )}
              <input
                type="number"
                step="0.01"
                placeholder="price"
                value={form.price ?? 0}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full rounded-xl border px-3 py-2"
                required
              />
              <div className="flex gap-2">
                <button type="submit" className="rounded-xl bg-brand-500 px-4 py-2 text-white">
                  {t('save')}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm(emptyProduct);
                    }}
                    className="rounded-xl bg-slate-100 px-4 py-2"
                  >
                    {t('cancel')}
                  </button>
                )}
              </div>
            </form>

            <div className="space-y-3">
              {products.map((product) => (
                <div key={product._id} className="flex items-center justify-between rounded-2xl border bg-white p-4">
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-brand-600">${product.price.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(product)} className="text-sm text-brand-600 hover:underline">
                      {t('editProduct')}
                    </button>
                    <button
                      onClick={async () => {
                        await deleteProduct(product._id);
                        await loadAll();
                      }}
                      className="text-sm text-red-600 hover:underline"
                    >
                      {t('delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && tab === 'orders' && (
          <div className="space-y-4">
            {orders.map((order) => {
              const customer =
                typeof order.user === 'object' ? (order.user as User).name : order.user;
              return (
                <div key={order._id} className="rounded-2xl border bg-white p-5">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">#{order._id.slice(-6).toUpperCase()}</p>
                      <p className="text-sm text-slate-500">{customer}</p>
                    </div>
                    <p className="font-bold text-brand-600">${order.totalAmount.toFixed(2)}</p>
                  </div>
                  <select
                    value={order.status}
                    onChange={async (e) => {
                      await updateOrderStatus(order._id, e.target.value);
                      await loadAll();
                    }}
                    className="rounded-xl border px-3 py-2"
                  >
                    {(['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'] as const).map(
                      (status) => (
                        <option key={status} value={status}>
                          {t(`status.${status}`)}
                        </option>
                      )
                    )}
                  </select>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </Layout>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
