import { Product } from '../types';
import { ProductImage } from './ProductImage';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../store/cartStore';

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const { t, i18n } = useTranslation();
  const addItem = useCartStore((state) => state.addItem);
  const isArabic = i18n.language === 'ar';

  return (
    <article className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
      <ProductImage
        src={product.image}
        alt={isArabic ? product.nameAr : product.name}
        category={product.category}
      />
      <div className="p-4">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-600">
          {isArabic ? product.categoryAr : product.category}
        </div>
        <h3 className="text-lg font-bold text-slate-900">
          {isArabic ? product.nameAr : product.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">
          {isArabic ? product.descriptionAr : product.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-brand-600">${product.price.toFixed(2)}</span>
          <button
            onClick={() => addItem(product)}
            className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            {t('addToCart')}
          </button>
        </div>
      </div>
    </article>
  );
}
