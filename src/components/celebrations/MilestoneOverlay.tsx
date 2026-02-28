import { memo, useEffect, useState } from 'react';
import type { Milestone } from '../../types';

interface Props {
  milestone: Milestone | null;
}

function MilestoneOverlayInner({ milestone }: Props) {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<Milestone | null>(null);

  useEffect(() => {
    if (!milestone) return;
    setCurrent(milestone);
    setVisible(true);

    const timer = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(timer);
  }, [milestone]);

  if (!current) return null;

  const colors: Record<string, string> = {
    orders: '#3b82f6',
    revenue: '#22c55e',
    combo: '#f59e0b',
    velocity: '#f59e0b',
    forecast: '#22d3ee',
  };

  const color = colors[current.type] || '#fff';

  return (
    <div
      className="fixed inset-x-0 bottom-32 flex items-center justify-center pointer-events-none"
      style={{ zIndex: 55 }}
    >
      <div
        className="text-center transition-all duration-500"
        style={{
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.7) translateY(20px)',
          opacity: visible ? 1 : 0,
        }}
      >
        <div
          className="text-xs font-semibold uppercase tracking-[0.3em] mb-1"
          style={{ color: color + '99' }}
        >
          MILESTONE
        </div>
        <div
          className="text-4xl font-black tracking-tight"
          style={{
            color,
            textShadow: `0 0 30px ${color}60, 0 0 60px ${color}30`,
          }}
        >
          {current.label}
        </div>
      </div>
    </div>
  );
}

export const MilestoneOverlay = memo(MilestoneOverlayInner);
