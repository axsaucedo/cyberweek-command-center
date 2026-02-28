import type { Order, OrderCategory } from './types';
import {
  CATEGORY_KEYS, CATEGORY_WEIGHTS, CATEGORIES,
  FIRST_NAMES, LAST_NAMES,
} from './constants';

let orderId = 0;

function weightedRandom(weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

export function generateOrder(): Order {
  const catIdx = weightedRandom(CATEGORY_WEIGHTS);
  const category: OrderCategory = CATEGORY_KEYS[catIdx];
  const catConfig = CATEGORIES[category];
  const productName = catConfig.products[Math.floor(Math.random() * catConfig.products.length)];

  const basePrice = 15 + Math.random() * 85;
  const isHighValue = Math.random() < 0.08;
  const amount = isHighValue
    ? 200 + Math.random() * 300
    : basePrice;

  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];

  orderId++;
  return {
    id: `order-${orderId}`,
    amount: Math.round(amount * 100) / 100,
    category,
    timestamp: Date.now(),
    customerName: `${firstName} ${lastName}`,
    productName,
  };
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}
