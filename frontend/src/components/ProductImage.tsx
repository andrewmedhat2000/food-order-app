import { getCategoryFallback, getCategoryPhoto, resolveProductImage } from '../utils/productImage';

interface Props {
  src: string;
  alt: string;
  category?: string;
  className?: string;
  wrapperClassName?: string;
}

export function ProductImage({
  src,
  alt,
  category,
  className = 'h-full w-full object-cover',
  wrapperClassName = 'h-48 w-full',
}: Props) {
  const photoSrc = resolveProductImage(src, category);
  const categoryPhoto = getCategoryPhoto(category);
  const placeholderSrc = getCategoryFallback(category);

  return (
    <div className={`overflow-hidden bg-orange-50 ${wrapperClassName}`}>
      <img
        src={photoSrc}
        alt={alt}
        className={className}
        decoding="async"
        referrerPolicy="no-referrer"
        onError={(event) => {
          const img = event.currentTarget;
          const step = img.dataset.fallbackStep ?? '0';

          if (step === '0' && img.src !== categoryPhoto) {
            img.dataset.fallbackStep = '1';
            img.src = categoryPhoto;
            return;
          }

          if (step !== '2' && img.src !== placeholderSrc) {
            img.dataset.fallbackStep = '2';
            img.src = placeholderSrc;
          }
        }}
      />
    </div>
  );
}
