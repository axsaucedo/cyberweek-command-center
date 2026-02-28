import type { ComboTier, ComboTierConfig, OrderCategory } from '../types';

export const COMBO_TIERS: Record<ComboTier, ComboTierConfig> = {
  none: {
    name: 'none',
    label: '',
    minCombo: 0,
    color: '#64748b',
    glowColor: 'rgba(100, 116, 139, 0.3)',
    particleIntensity: 0,
    shakeIntensity: 0,
    bgColor: '#0a0e1a',
    replenishMultiplier: 1,
    description: 'No sales streak active. Start selling to build momentum!',
  },
  browsing: {
    name: 'browsing',
    label: 'BROWSING',
    minCombo: 3,
    color: '#4ade80',
    glowColor: 'rgba(74, 222, 128, 0.3)',
    particleIntensity: 0.05,
    shakeIntensity: 0,
    bgColor: '#081a0e',
    replenishMultiplier: 1,
    description: 'Customers are starting to browse. The store is waking up.',
  },
  window_shopping: {
    name: 'window_shopping',
    label: 'WINDOW SHOPPING',
    minCombo: 8,
    color: '#2dd4bf',
    glowColor: 'rgba(45, 212, 191, 0.4)',
    particleIntensity: 0.1,
    shakeIntensity: 0,
    bgColor: '#081a16',
    replenishMultiplier: 1.2,
    description: 'Window shoppers are turning into buyers. Keep the displays fresh!',
  },
  adding_to_cart: {
    name: 'adding_to_cart',
    label: 'ADDING TO CART',
    minCombo: 15,
    color: '#22d3ee',
    glowColor: 'rgba(34, 211, 238, 0.4)',
    particleIntensity: 0.15,
    shakeIntensity: 0,
    bgColor: '#081620',
    replenishMultiplier: 1.5,
    description: 'Carts are filling up across the floor. Conversion is climbing!',
  },
  checkout_ready: {
    name: 'checkout_ready',
    label: 'CHECKOUT READY',
    minCombo: 25,
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.5)',
    particleIntensity: 0.2,
    shakeIntensity: 0.1,
    bgColor: '#0a1225',
    replenishMultiplier: 1.8,
    description: 'The checkout lines are forming. Registers are warming up!',
  },
  impulse_buyer: {
    name: 'impulse_buyer',
    label: 'IMPULSE BUYERS',
    minCombo: 40,
    color: '#818cf8',
    glowColor: 'rgba(129, 140, 248, 0.5)',
    particleIntensity: 0.3,
    shakeIntensity: 0.15,
    bgColor: '#0e0a1a',
    replenishMultiplier: 2.0,
    description: 'Impulse purchases everywhere! No one can resist these deals.',
  },
  shopping_spree: {
    name: 'shopping_spree',
    label: 'SHOPPING SPREE',
    minCombo: 60,
    color: '#a78bfa',
    glowColor: 'rgba(167, 139, 250, 0.5)',
    particleIntensity: 0.4,
    shakeIntensity: 0.2,
    bgColor: '#120a1a',
    replenishMultiplier: 2.5,
    description: 'Full-blown shopping spree! Bags upon bags at every register.',
  },
  vip_shopper: {
    name: 'vip_shopper',
    label: 'VIP SHOPPERS',
    minCombo: 85,
    color: '#fb923c',
    glowColor: 'rgba(251, 146, 60, 0.5)',
    particleIntensity: 0.5,
    shakeIntensity: 0.25,
    bgColor: '#1a120a',
    replenishMultiplier: 3.0,
    description: 'VIP customers are going all in. Premium purchases rolling in!',
  },
  retail_rush: {
    name: 'retail_rush',
    label: 'RETAIL RUSH',
    minCombo: 120,
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.6)',
    particleIntensity: 0.55,
    shakeIntensity: 0.3,
    bgColor: '#1a150a',
    replenishMultiplier: 3.5,
    description: 'A pure retail rush. The floor is packed, every aisle buzzing!',
  },
  flash_sale: {
    name: 'flash_sale',
    label: 'FLASH SALE',
    minCombo: 170,
    color: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.6)',
    particleIntensity: 0.6,
    shakeIntensity: 0.35,
    bgColor: '#1a1608',
    replenishMultiplier: 4.0,
    description: 'Flash sale energy! Products flying off the shelves!',
  },
  sold_out: {
    name: 'sold_out',
    label: 'SOLD OUT',
    minCombo: 250,
    color: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.6)',
    particleIntensity: 0.7,
    shakeIntensity: 0.4,
    bgColor: '#1a1008',
    replenishMultiplier: 5.0,
    description: 'Items selling out instantly! Restock can barely keep up!',
  },
  black_friday: {
    name: 'black_friday',
    label: 'BLACK FRIDAY',
    minCombo: 350,
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.6)',
    particleIntensity: 0.75,
    shakeIntensity: 0.45,
    bgColor: '#1a0c0c',
    replenishMultiplier: 6.0,
    description: 'Black Friday levels of chaos! Record-shattering demand!',
  },
  doorbuster: {
    name: 'doorbuster',
    label: 'DOORBUSTER',
    minCombo: 500,
    color: '#dc2626',
    glowColor: 'rgba(220, 38, 38, 0.6)',
    particleIntensity: 0.8,
    shakeIntensity: 0.5,
    bgColor: '#1f0a0a',
    replenishMultiplier: 7.0,
    description: 'Doorbuster deals have been unleashed. Pure retail pandemonium!',
  },
  mega_sale: {
    name: 'mega_sale',
    label: 'MEGA SALE',
    minCombo: 750,
    color: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.7)',
    particleIntensity: 0.85,
    shakeIntensity: 0.55,
    bgColor: '#200a10',
    replenishMultiplier: 8.0,
    description: 'The mega sale of the century. Revenue numbers are staggering.',
  },
  retail_empire: {
    name: 'retail_empire',
    label: 'RETAIL EMPIRE',
    minCombo: 1000,
    color: '#e11d48',
    glowColor: 'rgba(225, 29, 72, 0.7)',
    particleIntensity: 0.9,
    shakeIntensity: 0.6,
    bgColor: '#220810',
    replenishMultiplier: 10.0,
    description: 'You have built a retail empire. Every transaction is gold.',
  },
  market_domination: {
    name: 'market_domination',
    label: 'MARKET DOMINATION',
    minCombo: 1500,
    color: '#fb7185',
    glowColor: 'rgba(251, 113, 133, 0.7)',
    particleIntensity: 0.92,
    shakeIntensity: 0.65,
    bgColor: '#250810',
    replenishMultiplier: 12.0,
    description: 'Total market domination. Competitors can only watch in awe.',
  },
  global_takeover: {
    name: 'global_takeover',
    label: 'GLOBAL TAKEOVER',
    minCombo: 2000,
    color: '#f472b6',
    glowColor: 'rgba(244, 114, 182, 0.8)',
    particleIntensity: 0.95,
    shakeIntensity: 0.7,
    bgColor: '#250812',
    replenishMultiplier: 15.0,
    description: 'Global retail takeover. Every market on the planet is yours.',
  },
  retail_singularity: {
    name: 'retail_singularity',
    label: 'RETAIL SINGULARITY',
    minCombo: 3000,
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.8)',
    particleIntensity: 0.97,
    shakeIntensity: 0.75,
    bgColor: '#280814',
    replenishMultiplier: 20.0,
    description: 'A retail singularity. Commerce itself bends to your will.',
  },
  commerce_god: {
    name: 'commerce_god',
    label: 'COMMERCE GOD',
    minCombo: 5000,
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.9)',
    particleIntensity: 0.98,
    shakeIntensity: 0.8,
    bgColor: '#1a1408',
    replenishMultiplier: 25.0,
    description: 'The god of commerce. Every purchase in existence flows through you.',
  },
  retail_nirvana: {
    name: 'retail_nirvana',
    label: 'RETAIL NIRVANA',
    minCombo: 10000,
    color: '#ffffff',
    glowColor: 'rgba(255, 255, 255, 0.9)',
    particleIntensity: 1.0,
    shakeIntensity: 0.85,
    bgColor: '#1a1a1a',
    replenishMultiplier: 30.0,
    description: 'Retail nirvana. The ultimate state of commercial transcendence.',
  },
};

export const COMBO_TIER_ORDER: ComboTier[] = [
  'retail_nirvana', 'commerce_god', 'retail_singularity', 'global_takeover', 'market_domination',
  'retail_empire', 'mega_sale', 'doorbuster', 'black_friday', 'sold_out',
  'flash_sale', 'retail_rush', 'vip_shopper', 'shopping_spree', 'impulse_buyer',
  'checkout_ready', 'adding_to_cart', 'window_shopping', 'browsing', 'none',
];

export function getTierForCombo(count: number): ComboTier {
  for (const tier of COMBO_TIER_ORDER) {
    if (count >= COMBO_TIERS[tier].minCombo) return tier;
  }
  return 'none';
}

export function getTierIndex(tier: ComboTier): number {
  return COMBO_TIER_ORDER.indexOf(tier);
}

export const BASE_COMBO_DECAY_MS = 3000;
export const MAX_COMBO_DECAY_MS = 5000;

export interface CategoryConfig {
  label: string;
  icon: string;
  color: string;
  products: string[];
}

export const CATEGORIES: Record<OrderCategory, CategoryConfig> = {
  shoes: {
    label: 'Shoes',
    icon: 'Footprints',
    color: '#3b82f6',
    products: ['Running Shoes', 'Sneakers', 'Boots', 'Sandals', 'Heels', 'Loafers', 'Slip-ons', 'High Tops'],
  },
  shirts: {
    label: 'Shirts',
    icon: 'Shirt',
    color: '#22c55e',
    products: ['Polo Shirt', 'T-Shirt', 'Button Down', 'Henley', 'Flannel', 'Blouse', 'Tank Top', 'Crop Top'],
  },
  pants: {
    label: 'Pants',
    icon: 'Scissors',
    color: '#06b6d4',
    products: ['Jeans', 'Chinos', 'Joggers', 'Cargo Pants', 'Trousers', 'Shorts', 'Leggings', 'Sweatpants'],
  },
  dresses: {
    label: 'Dresses',
    icon: 'Sparkles',
    color: '#ec4899',
    products: ['Maxi Dress', 'Cocktail Dress', 'Sundress', 'Wrap Dress', 'Midi Dress', 'Mini Dress', 'A-Line Dress'],
  },
  jackets: {
    label: 'Jackets',
    icon: 'CloudSnow',
    color: '#f97316',
    products: ['Bomber Jacket', 'Denim Jacket', 'Puffer Coat', 'Blazer', 'Windbreaker', 'Leather Jacket', 'Parka'],
  },
  accessories: {
    label: 'Accessories',
    icon: 'Watch',
    color: '#eab308',
    products: ['Watch', 'Sunglasses', 'Belt', 'Scarf', 'Hat', 'Necklace', 'Bracelet', 'Ring'],
  },
  sportswear: {
    label: 'Sportswear',
    icon: 'Dumbbell',
    color: '#10b981',
    products: ['Yoga Pants', 'Sports Bra', 'Athletic Shorts', 'Compression Shirt', 'Track Suit', 'Swim Trunks'],
  },
  bags: {
    label: 'Bags',
    icon: 'ShoppingBag',
    color: '#f472b6',
    products: ['Tote Bag', 'Backpack', 'Clutch', 'Crossbody Bag', 'Messenger Bag', 'Duffle Bag', 'Wallet'],
  },
};

export const CATEGORY_KEYS: OrderCategory[] = [
  'shoes', 'shirts', 'pants', 'dresses', 'jackets', 'accessories', 'sportswear', 'bags',
];

export const CATEGORY_WEIGHTS = [0.18, 0.2, 0.14, 0.12, 0.1, 0.1, 0.08, 0.08];

export const ORDER_MILESTONES = [50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000];
export const REVENUE_MILESTONES = [1000, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];
export const VELOCITY_MILESTONES = [100, 500, 1000, 5000, 10000];
export const FORECAST_MILESTONES = [10, 25, 50, 75, 90, 100, 110, 125, 150, 200];

export const FIRST_NAMES = [
  'Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn',
  'Avery', 'Blake', 'Cameron', 'Dakota', 'Emery', 'Finley', 'Harper', 'Jamie',
  'Kai', 'Logan', 'Marlo', 'Nico', 'Parker', 'Reese', 'Sage', 'Tatum',
];

export const LAST_NAMES = [
  'Chen', 'Smith', 'Park', 'Garcia', 'Kim', 'Patel', 'Jones', 'Williams',
  'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas',
  'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Robinson', 'Clark', 'Lewis',
];
