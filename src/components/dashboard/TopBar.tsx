import { memo, useEffect, useState } from 'react';
import { Zap, BookOpen, Volume2, VolumeX } from 'lucide-react';
import { formatDuration } from '../../utils';
import type { DashboardStats, SoundConfig } from '../../types';
import { MilestoneTracker } from '../milestones/MilestoneTracker';

interface Props {
  isPlaying: boolean;
  sessionStart: number;
  stats: DashboardStats;
  soundConfig: SoundConfig;
  onOpenRules: () => void;
  onToggleMute: () => void;
}

function TopBarInner({ isPlaying, sessionStart, stats, soundConfig, onOpenRules, onToggleMute }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isPlaying || sessionStart === 0) return;
    const tick = () => setElapsed(Date.now() - sessionStart);
    const id = setInterval(tick, 1000);
    tick();
    return () => clearInterval(id);
  }, [isPlaying, sessionStart]);

  return (
    <div
      className="flex items-center justify-between px-6 h-14 flex-shrink-0"
      style={{
        background: 'rgba(255,255,255,0.02)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center gap-3">
        <Zap size={22} className="text-amber-400" />
        <h1 className="text-lg font-bold text-white tracking-wide">
          CYBERWEEK PANEL
        </h1>
      </div>

      <MilestoneTracker stats={stats} />

      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMute}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          title={soundConfig.enabled ? 'Mute audio' : 'Unmute audio'}
        >
          {soundConfig.enabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
        </button>
        <button
          onClick={onOpenRules}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <BookOpen size={12} />
          <span>Rules</span>
        </button>
        <div className="text-sm font-mono text-gray-400 tabular-nums">
          {formatDuration(elapsed)}
        </div>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{
            background: isPlaying ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            color: isPlaying ? '#4ade80' : '#f87171',
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: isPlaying ? '#4ade80' : '#f87171',
              animation: isPlaying ? 'pulse 2s infinite' : 'none',
            }}
          />
          {isPlaying ? 'LIVE' : 'PAUSED'}
        </div>
      </div>
    </div>
  );
}

export const TopBar = memo(TopBarInner);
