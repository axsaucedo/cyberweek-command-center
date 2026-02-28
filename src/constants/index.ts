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
  curious_newcomer: {
    name: 'curious_newcomer',
    label: 'CURIOUS NEWCOMER',
    minCombo: 3,
    color: '#4ade80',
    glowColor: 'rgba(74, 222, 128, 0.3)',
    particleIntensity: 0.05,
    shakeIntensity: 0,
    bgColor: '#081a0e',
    replenishMultiplier: 1,
    description: 'A fresh face on the scene. Just getting warmed up.',
  },
  window_gazer: {
    name: 'window_gazer',
    label: 'WINDOW GAZER',
    minCombo: 8,
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    particleIntensity: 0.1,
    shakeIntensity: 0,
    bgColor: '#081420',
    replenishMultiplier: 1.2,
    description: 'Eyes on everything, mind made up. Ready to commit.',
  },
  cart_hoarder: {
    name: 'cart_hoarder',
    label: 'CART HOARDER',
    minCombo: 15,
    color: '#a78bfa',
    glowColor: 'rgba(167, 139, 250, 0.4)',
    particleIntensity: 0.15,
    shakeIntensity: 0,
    bgColor: '#100a1a',
    replenishMultiplier: 1.5,
    description: 'Grabbing everything in sight. The cart is overflowing!',
  },
  deal_seeker: {
    name: 'deal_seeker',
    label: 'DEAL SEEKER',
    minCombo: 25,
    color: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.5)',
    particleIntensity: 0.2,
    shakeIntensity: 0.1,
    bgColor: '#1a1608',
    replenishMultiplier: 1.8,
    description: 'Sniffing out every bargain. No deal escapes this one.',
  },
  impulse_buyer: {
    name: 'impulse_buyer',
    label: 'IMPULSE BUYER',
    minCombo: 40,
    color: '#2dd4bf',
    glowColor: 'rgba(45, 212, 191, 0.5)',
    particleIntensity: 0.3,
    shakeIntensity: 0.15,
    bgColor: '#081a16',
    replenishMultiplier: 2.0,
    description: 'No hesitation, no second thoughts. Just pure buying instinct.',
  },
  big_spender: {
    name: 'big_spender',
    label: 'BIG SPENDER',
    minCombo: 60,
    color: '#f472b6',
    glowColor: 'rgba(244, 114, 182, 0.5)',
    particleIntensity: 0.4,
    shakeIntensity: 0.2,
    bgColor: '#1a0a14',
    replenishMultiplier: 2.5,
    description: 'Money flows freely. Bags piling up at every register.',
  },
  vip_shopper: {
    name: 'vip_shopper',
    label: 'VIP SHOPPER',
    minCombo: 85,
    color: '#22d3ee',
    glowColor: 'rgba(34, 211, 238, 0.5)',
    particleIntensity: 0.5,
    shakeIntensity: 0.25,
    bgColor: '#081620',
    replenishMultiplier: 3.0,
    description: 'Red carpet treatment earned. Premium purchases rolling in!',
  },
  floor_captain: {
    name: 'floor_captain',
    label: 'FLOOR CAPTAIN',
    minCombo: 120,
    color: '#fb923c',
    glowColor: 'rgba(251, 146, 60, 0.6)',
    particleIntensity: 0.55,
    shakeIntensity: 0.3,
    bgColor: '#1a120a',
    replenishMultiplier: 3.5,
    description: 'Running the show floor. Every aisle answers to you.',
  },
  trendsetter: {
    name: 'trendsetter',
    label: 'STYLE TRENDSETTER',
    minCombo: 170,
    color: '#818cf8',
    glowColor: 'rgba(129, 140, 248, 0.6)',
    particleIntensity: 0.6,
    shakeIntensity: 0.35,
    bgColor: '#0e0a1a',
    replenishMultiplier: 4.0,
    description: 'Setting the shopping trends now. Every storefront follows your lead.',
  },
  crowd_puller: {
    name: 'crowd_puller',
    label: 'CROWD PULLER',
    minCombo: 250,
    color: '#34d399',
    glowColor: 'rgba(52, 211, 153, 0.6)',
    particleIntensity: 0.7,
    shakeIntensity: 0.4,
    bgColor: '#081a10',
    replenishMultiplier: 5.0,
    description: 'Massive crowds drawn in by your reputation. The floor is packed!',
  },
  high_roller: {
    name: 'high_roller',
    label: 'HIGH ROLLER',
    minCombo: 350,
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.6)',
    particleIntensity: 0.75,
    shakeIntensity: 0.45,
    bgColor: '#1a150a',
    replenishMultiplier: 6.0,
    description: 'High rollers are spending big. Premium transactions across the board!',
  },
  doorbuster: {
    name: 'doorbuster',
    label: 'DOORBUSTER',
    minCombo: 500,
    color: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.6)',
    particleIntensity: 0.8,
    shakeIntensity: 0.5,
    bgColor: '#14081a',
    replenishMultiplier: 7.0,
    description: 'Doorbuster deals have been unleashed. Pure retail pandemonium!',
  },
  power_broker: {
    name: 'power_broker',
    label: 'DEAL BROKER',
    minCombo: 750,
    color: '#22d3ee',
    glowColor: 'rgba(34, 211, 238, 0.7)',
    particleIntensity: 0.85,
    shakeIntensity: 0.55,
    bgColor: '#081620',
    replenishMultiplier: 8.0,
    description: 'Brokering the deals that shape the market. Unstoppable retail influence.',
  },
  mogul: {
    name: 'mogul',
    label: 'RETAIL MOGUL',
    minCombo: 1000,
    color: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.7)',
    particleIntensity: 0.9,
    shakeIntensity: 0.6,
    bgColor: '#1a1608',
    replenishMultiplier: 10.0,
    description: 'A true retail mogul. Every transaction turns to gold.',
  },
  titan: {
    name: 'titan',
    label: 'COMMERCE TITAN',
    minCombo: 1500,
    color: '#f472b6',
    glowColor: 'rgba(244, 114, 182, 0.7)',
    particleIntensity: 0.92,
    shakeIntensity: 0.65,
    bgColor: '#1a0a14',
    replenishMultiplier: 12.0,
    description: 'A titan of commerce. Competitors can only watch in awe.',
  },
  overlord: {
    name: 'overlord',
    label: 'CHECKOUT OVERLORD',
    minCombo: 2000,
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.8)',
    particleIntensity: 0.95,
    shakeIntensity: 0.7,
    bgColor: '#081422',
    replenishMultiplier: 15.0,
    description: 'Checkout lines bend to your command. Every register answers to you.',
  },
  legend: {
    name: 'legend',
    label: 'ECOMMERCE LEGEND',
    minCombo: 3000,
    color: '#a78bfa',
    glowColor: 'rgba(167, 139, 250, 0.8)',
    particleIntensity: 0.97,
    shakeIntensity: 0.75,
    bgColor: '#100a1a',
    replenishMultiplier: 20.0,
    description: 'A living ecommerce legend. The marketplace bends to your will.',
  },
  mythic: {
    name: 'mythic',
    label: 'BLACK FRIDAY DEITY',
    minCombo: 5000,
    color: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.9)',
    particleIntensity: 0.98,
    shakeIntensity: 0.8,
    bgColor: '#1a1608',
    replenishMultiplier: 25.0,
    description: 'Divine shopping fury unleashed. Every cart on earth fills in your name.',
  },
  transcendent: {
    name: 'transcendent',
    label: 'CYBER SUPREME',
    minCombo: 10000,
    color: '#ffffff',
    glowColor: 'rgba(255, 255, 255, 0.9)',
    particleIntensity: 1.0,
    shakeIntensity: 0.85,
    bgColor: '#1a1a1a',
    replenishMultiplier: 30.0,
    description: 'Cyber Supreme. The ultimate pinnacle of retail domination.',
  },
};

export const COMBO_TIER_ORDER: ComboTier[] = [
  'transcendent', 'mythic', 'legend', 'overlord', 'titan',
  'mogul', 'power_broker', 'doorbuster', 'high_roller', 'crowd_puller',
  'trendsetter', 'floor_captain', 'vip_shopper', 'big_spender', 'impulse_buyer',
  'deal_seeker', 'cart_hoarder', 'window_gazer', 'curious_newcomer', 'none',
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
