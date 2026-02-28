export type OrderCategory =
  | 'shoes'
  | 'shirts'
  | 'pants'
  | 'dresses'
  | 'jackets'
  | 'accessories'
  | 'sportswear'
  | 'bags';

export interface Order {
  id: string;
  amount: number;
  category: OrderCategory;
  timestamp: number;
  customerName: string;
  productName: string;
}

export interface ComboState {
  count: number;
  tier: ComboTier;
  lastOrderTime: number;
  decayRemaining: number;
  maxDecay: number;
  isActive: boolean;
  maxCombo: number;
  maxTier: ComboTier;
}

export type ComboTier =
  | 'none'
  | 'browsing'
  | 'window_shopping'
  | 'adding_to_cart'
  | 'checkout_ready'
  | 'impulse_buyer'
  | 'shopping_spree'
  | 'vip_shopper'
  | 'retail_rush'
  | 'flash_sale'
  | 'sold_out'
  | 'black_friday'
  | 'doorbuster'
  | 'mega_sale'
  | 'retail_empire'
  | 'market_domination'
  | 'global_takeover'
  | 'retail_singularity'
  | 'commerce_god'
  | 'retail_nirvana';

export interface ComboTierConfig {
  name: string;
  label: string;
  minCombo: number;
  color: string;
  glowColor: string;
  particleIntensity: number;
  shakeIntensity: number;
  bgColor: string;
  replenishMultiplier: number;
  description: string;
}

export interface SimulationConfig {
  ordersPerMinute: number;
  speedMultiplier: number;
  isPlaying: boolean;
  burstMode: boolean;
  forecastEnabled: boolean;
  forecastOPM: number;
  volatility: number;
  trendRange: number;
  chartMode: 'net' | 'cumulative';
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  currentOPM: number;
  peakOPM: number;
  sessionStart: number;
  forecastRevenue: number;
}

export interface SoundConfig {
  enabled: boolean;
  masterVolume: number;
  orderSounds: boolean;
  comboSounds: boolean;
  milestoneSounds: boolean;
}

export interface EffectsConfig {
  intensity: number;
}

export interface Milestone {
  id: string;
  type: 'orders' | 'revenue' | 'combo' | 'velocity' | 'forecast';
  label: string;
  value: number;
  timestamp: number;
}

export interface ForecastState {
  targetRevenue: number;
  currentRevenue: number;
  isAbove: boolean;
  percentComplete: number;
  lastMilestonePercent: number;
}
