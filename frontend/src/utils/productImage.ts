function createSvgDataUri(label: string, background: string): string {
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">',
    `<rect width="600" height="400" fill="${background}"/>`,
    `<text x="300" y="215" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" fill="#ffffff">${label}</text>`,
    '</svg>',
  ].join('');

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const CATEGORY_PHOTOS: Record<string, string> = {
  pizza: 'https://images.pexels.com/photos/1146760/pexels-photo-1146760.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  burgers: 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  burger: 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  salads: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  salad: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  pasta: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  desserts:
    'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  dessert:
    'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  drinks:
    'https://images.pexels.com/photos/8679343/pexels-photo-8679343.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
  drink:
    'https://images.pexels.com/photos/8679343/pexels-photo-8679343.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
};

const CATEGORY_LABELS: Record<string, string> = {
  pizza: 'Pizza',
  burgers: 'Burger',
  burger: 'Burger',
  salads: 'Salad',
  salad: 'Salad',
  pasta: 'Pasta',
  desserts: 'Dessert',
  dessert: 'Dessert',
  drinks: 'Drink',
  drink: 'Drink',
};

const DEFAULT_PHOTO =
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop';

export function getCategoryPhoto(category?: string): string {
  if (!category) return DEFAULT_PHOTO;
  return CATEGORY_PHOTOS[category.toLowerCase()] ?? DEFAULT_PHOTO;
}

export function getCategoryFallback(category?: string): string {
  if (!category) return createSvgDataUri('Food', '#f97316');
  const label = CATEGORY_LABELS[category.toLowerCase()] ?? 'Food';
  const colors: Record<string, string> = {
    Pizza: '#ea580c',
    Burger: '#d97706',
    Salad: '#16a34a',
    Pasta: '#c2410c',
    Dessert: '#be185d',
    Drink: '#0284c7',
    Food: '#f97316',
  };
  return createSvgDataUri(label, colors[label] ?? '#f97316');
}

function isBrokenImageUrl(image: string): boolean {
  return (
    image.includes('images.unsplash.com') ||
    image.startsWith('/images/') ||
    image.includes('picsum.photos') ||
    image.includes('/photos/45202/') ||
    image.includes('brownie-dessert-cube-chocolate-45202') ||
    image.includes('/photos/143133/')
  );
}

export function resolveProductImage(image: string | undefined, category?: string): string {
  if (image?.trim() && (image.startsWith('http://') || image.startsWith('https://')) && !isBrokenImageUrl(image)) {
    return image;
  }

  return getCategoryPhoto(category);
}

export const FALLBACK_IMAGE = getCategoryFallback();
