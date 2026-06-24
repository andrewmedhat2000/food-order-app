import { OrderStatus } from '../types';
import { useTranslation } from 'react-i18next';

const steps: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

interface Props {
  status: OrderStatus;
}

export function OrderTracker({ status }: Props) {
  const { t } = useTranslation();
  const currentIndex = steps.indexOf(status);

  if (status === 'cancelled') {
    return (
      <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        {t('status.cancelled')}
      </div>
    );
  }

  return (
    <ol className="grid gap-3 sm:grid-cols-5">
      {steps.map((step, index) => {
        const active = index <= currentIndex;
        return (
          <li
            key={step}
            className={`rounded-xl border px-3 py-3 text-center text-xs font-semibold sm:text-sm ${
              active
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-slate-200 bg-white text-slate-400'
            }`}
          >
            {t(`status.${step}`)}
          </li>
        );
      })}
    </ol>
  );
}
