import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout';
import { Navbar } from '../components/Navbar';
import { OrderTracker } from '../components/OrderTracker';
import { fetchMyOrders, fetchOrder } from '../services/foodService';
import { Order } from '../types';

export function OrdersPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="mb-6 text-3xl font-bold">{t('orders')}</h1>
        {loading && <p>{t('loading')}</p>}
        {!loading && orders.length === 0 && <p className="text-slate-600">{t('noOrders')}</p>}
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="block rounded-2xl border border-orange-100 bg-white p-5 transition hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">#{order._id.slice(-6).toUpperCase()}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-end">
                  <p className="font-bold text-brand-600">${order.totalAmount.toFixed(2)}</p>
                  <p className="text-sm">{t(`status.${order.status}`)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </Layout>
  );
}

export function OrderDetailPage() {
  const { t, i18n } = useTranslation();
  const { id: orderId = '' } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const isArabic = i18n.language === 'ar';

  useEffect(() => {
    if (!orderId) return;
    fetchOrder(orderId)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <Layout>
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-10">{t('loading')}</main>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-10">Order not found</main>
      </Layout>
    );
  }

  return (
    <Layout>
      <Navbar />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-10">
        <h1 className="text-3xl font-bold">{t('trackOrder')}</h1>
        <OrderTracker status={order.status} />
        <section className="rounded-2xl border border-orange-100 bg-white p-5">
          <h2 className="mb-4 font-semibold">{t('orderStatus')}</h2>
          <ul className="space-y-3">
            {order.items.map((item) => (
              <li key={item.productId} className="flex items-center justify-between gap-4">
                <span>
                  {isArabic ? item.nameAr : item.name} × {item.quantity}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t pt-4 text-sm text-slate-600">
            <p>{t('deliveryAddress')}: {order.deliveryAddress}</p>
            <p>{t('paymentMethod')}: {order.paymentMethod === 'cod' ? t('cashOnDelivery') : t('onlinePayment')}</p>
            <p>{t('payment.pending')}: {t(`payment.${order.paymentStatus}`)}</p>
            <p className="mt-2 text-lg font-bold text-brand-600">
              {t('total')}: ${order.totalAmount.toFixed(2)}
            </p>
          </div>
        </section>
      </main>
    </Layout>
  );
}
