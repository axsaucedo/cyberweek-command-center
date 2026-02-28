import { memo } from 'react';
import type { DashboardStats } from '../../types';
import { ORDER_MILESTONES, REVENUE_MILESTONES } from '../../constants';
import { formatNumber, formatCurrency } from '../../utils';

interface Props {
  stats: DashboardStats;
}

function getNextMilestone(current: number, milestones: number[]): number | null {
  for (const m of milestones) {
    if (current < m) return m;
  }
  return null;
}

function MilestoneTrackerInner({ stats }: Props) {
  const nextOrders = getNextMilestone(stats.totalOrders, ORDER_MILESTONES);
  const nextRevenue = getNextMilestone(stats.totalRevenue, REVENUE_MILESTONES);

  if (!nextOrders && !nextRevenue) return null;

  return (
    <div className="flex items-center gap-4">
      {nextOrders && (
        <div className="flex items-center gap-1.5">
          <div className="text-[10px] text-gray-600 uppercase tracking-wider">Next</div>
          <div className="text-xs font-semibold text-blue-400 tabular-nums">
            {formatNumber(nextOrders)} orders
          </div>
          <div className="w-16 h-1 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${Math.min(100, (stats.totalOrders / nextOrders) * 100)}%` }}
            />
          </div>
        </div>
      )}
      {nextRevenue && (
        <div className="flex items-center gap-1.5">
          <div className="text-[10px] text-gray-600 uppercase tracking-wider">Next</div>
          <div className="text-xs font-semibold text-emerald-400 tabular-nums">
            {formatCurrency(nextRevenue)}
          </div>
          <div className="w-16 h-1 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, (stats.totalRevenue / nextRevenue) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export const MilestoneTracker = memo(MilestoneTrackerInner);
