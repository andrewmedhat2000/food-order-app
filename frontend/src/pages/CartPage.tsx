import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout';
import { Navbar } from '../components/Navbar';
import { ProductImage } from '../components/ProductImage';
import { StripeCheckoutForm } from '../components/StripeCheckoutForm';
import { createOrder } from '../services/foodService';
import { getApiErrorMessage } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { getStripe } from '../utils/getStripe';
import { isStripeConfigured, STRIPE_SETUP_HINT } from '../utils/stripeConfig';
import { Order } from '../types';

export function CartPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { items, updateQuantity, removeItem, clearCart, total } = useCartStore();
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('cod');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const isArabic = i18n.language === 'ar';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (items.length === 0) return;

    if (paymentMethod === 'online' && !isStripeConfigured()) {
      setError(STRIPE_SETUP_HINT);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await createOrder({
        items: items.map((item) => ({ productId: item.product._id, quantity: item.quantity })),
        paymentMethod,
        deliveryAddress: address,
        notes,
      });

      if (paymentMethod === 'online' && result.clientSecret) {
        setPendingOrder(result.order);
        setClientSecret(result.clientSecret);
      } else {
        clearCart();
        navigate(`/orders/${result.order._id}`);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to place order'));
    } finally {
      setLoading(false);
    }
  }

  if (clientSecret && pendingOrder) {
    return (
      <Layout>
        <Navbar />
        <main className="mx-auto max-w-xl px-4 py-10">
          <h1 className="mb-6 text-2xl font-bold">{t('checkout')}</h1>
          <Elements stripe={getStripe()} options={{ clientSecret }}>
            <StripeCheckoutForm
              orderId={pendingOrder._id}
              onSuccess={() => {
                clearCart();
                navigate(`/orders/${pendingOrder._id}`);
              }}
            />
          </Elements>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-6 text-3xl font-bold">{t('cart')}</h1>

        {items.length === 0 ? (
          <p className="text-slate-600">{t('emptyCart')}</p>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.product._id}
                  className="flex items-center gap-4 rounded-2xl border border-orange-100 bg-white p-4"
                >
                  <ProductImage
                    src={item.product.image}
                    alt={isArabic ? item.product.nameAr : item.product.name}
                    category={item.product.category}
                    wrapperClassName="h-20 w-20 shrink-0 rounded-xl"
                    className="h-full w-full rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {isArabic ? item.product.nameAr : item.product.name}
                    </h3>
                    <p className="text-brand-600">${item.product.price.toFixed(2)}</p>
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.product._id, Number(e.target.value))}
                    className="w-16 rounded-lg border px-2 py-1"
                    aria-label={t('quantity')}
                  />
                  <button
                    onClick={() => removeItem(item.product._id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    {t('remove')}
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-orange-100 bg-white p-6">
              <div>
                <label className="mb-1 block text-sm font-medium">{t('deliveryAddress')}</label>
                <input
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">{t('notes')}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2"
                  rows={3}
                />
              </div>
              <fieldset>
                <legend className="mb-2 text-sm font-medium">{t('paymentMethod')}</legend>
                <label className="mr-4 inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  {t('cashOnDelivery')}
                </label>
                <label className={`inline-flex items-center gap-2 ${!isStripeConfigured() ? 'opacity-60' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                    disabled={!isStripeConfigured()}
                  />
                  {t('onlinePayment')}
                </label>
              </fieldset>
              {paymentMethod === 'online' && !isStripeConfigured() && (
                <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{STRIPE_SETUP_HINT}</p>
              )}
              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-lg font-bold">
                  {t('total')}: ${total().toFixed(2)}
                </span>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
                >
                  {loading ? t('processing') : t('placeOrder')}
                </button>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </form>
          </div>
        )}
      </main>
    </Layout>
  );
}
