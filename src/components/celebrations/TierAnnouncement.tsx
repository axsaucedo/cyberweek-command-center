import { memo, useEffect, useState } from 'react';
import { COMBO_TIERS } from '../../constants';
import type { ComboTier } from '../../types';

interface Announcement {
  id: number;
  tier: ComboTier;
  combo: number;
}

interface Props {
  announcement: Announcement | null;
}

function TierAnnouncementInner({ announcement }: Props) {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<Announcement | null>(null);

  useEffect(() => {
    if (!announcement) return;
    setCurrent(announcement);
    setVisible(true);

    const timer = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timer);
  }, [announcement]);

  if (!current) return null;

  const tierConfig = COMBO_TIERS[current.tier];

  return (
    <div
      className="fixed inset-x-0 top-20 flex items-center justify-center pointer-events-none"
      style={{ zIndex: 60 }}
    >
      <div
        className="text-center transition-all duration-500"
        style={{
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.5) translateY(-30px)',
          opacity: visible ? 1 : 0,
        }}
      >
        <div
          className="text-xs font-semibold uppercase tracking-[0.4em] mb-1"
          style={{
            color: tierConfig.color + 'aa',
            textShadow: `0 0 20px ${tierConfig.glowColor}`,
          }}
        >
          COMBO
        </div>
        <div
          className="text-6xl font-black tracking-tight"
          style={{
            color: tierConfig.color,
            textShadow: `0 0 40px ${tierConfig.glowColor}, 0 0 80px ${tierConfig.glowColor}`,
          }}
        >
          {tierConfig.label}
        </div>
        <div
          className="text-3xl font-bold mt-1"
          style={{
            color: tierConfig.color,
            textShadow: `0 0 20px ${tierConfig.glowColor}`,
          }}
        >
          x{current.combo}
        </div>
      </div>
    </div>
  );
}

export const TierAnnouncement = memo(TierAnnouncementInner);
