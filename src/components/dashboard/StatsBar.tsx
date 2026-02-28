import { memo } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, Gauge } from 'lucide-react';
import type { ComboTier, DashboardStats } from '../../types';
import { COMBO_TIERS } from '../../constants';
import { formatCurrency, formatNumber } from '../../utils';

interface Props {
  stats: DashboardStats;
  tier: ComboTier;
  forecastEnabled: boolean;
  forecastOPM: number;
}

function StatCard({ icon, label, value, subValue, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  color: string;
}) {
  return (
    <div
      className="flex-1 rounded-xl p-3 flex items-center gap-3"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ background: color + '20' }}
      >
        {icon}
      </div>
      <div>
        <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
        <div className="text-lg font-bold text-white tabular-nums">{value}</div>
        {subValue && (
          <div className="text-xs text-gray-500 tabular-nums">{subValue}</div>
        )}
      </div>
    </div>
  );
}

function StatsBarInner({ stats, tier, forecastEnabled, forecastOPM }: Props) {
  const tierConfig = COMBO_TIERS[tier];

  return (
    <div className="flex gap-3 flex-shrink-0">
      <StatCard
        icon={<ShoppingCart size={18} style={{ color: '#3b82f6' }} />}
        label="Orders"
        value={formatNumber(stats.totalOrders)}
        color="#3b82f6"
      />
      <StatCard
        icon={<DollarSign size={18} style={{ color: '#22c55e' }} />}
        label="Revenue"
        value={formatCurrency(stats.totalRevenue)}
        color="#22c55e"
      />
      <StatCard
        icon={<Gauge size={18} style={{ color: tierConfig.color }} />}
        label="Velocity"
        value={`${formatNumber(stats.currentOPM)} OPM`}
        subValue={`Peak: ${formatNumber(stats.peakOPM)}`}
        color={tierConfig.color}
      />
      {forecastEnabled && (
        <StatCard
          icon={<TrendingUp size={18} style={{ color: '#fbbf24' }} />}
          label="Forecast"
          value={`${forecastOPM.toLocaleString()} OPM`}
          subValue={stats.currentOPM >= forecastOPM ? 'Above target' : 'Below target'}
          color="#fbbf24"
        />
      )}
    </div>
  );
}

export const StatsBar = memo(StatsBarInner);
