import { memo } from 'react';
import { X } from 'lucide-react';
import { COMBO_TIERS, COMBO_TIER_ORDER, getTierIndex } from '../../constants';
import type { ComboTier } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentTier: ComboTier;
  maxTier: ComboTier;
  maxCombo: number;
}

function ComboRulesMenuInner({ isOpen, onClose, currentTier, maxTier, maxCombo }: Props) {
  if (!isOpen) return null;

  const currentIdx = getTierIndex(currentTier);
  const maxIdx = getTierIndex(maxTier);

  const tiers = [...COMBO_TIER_ORDER].reverse().filter(t => t !== 'none');

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 70, background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[80vh] rounded-2xl overflow-hidden"
        style={{
          background: '#0f1219',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Combo Tiers</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {maxCombo > 0 && (
          <div className="px-4 py-3 border-b border-white/5">
            <div className="text-xs text-gray-500">Session Best</div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-lg font-bold"
                style={{ color: COMBO_TIERS[maxTier].color }}
              >
                x{maxCombo}
              </span>
              {maxTier !== 'none' && (
                <span
                  className="text-sm font-semibold uppercase tracking-wider"
                  style={{ color: COMBO_TIERS[maxTier].color }}
                >
                  {COMBO_TIERS[maxTier].label}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="overflow-y-auto max-h-[60vh] p-4 space-y-1.5">
          {tiers.map(tierKey => {
            const config = COMBO_TIERS[tierKey];
            const tierIdx = getTierIndex(tierKey);
            const isCurrent = tierKey === currentTier;
            const isReached = tierIdx <= maxIdx;

            return (
              <div
                key={tierKey}
                className="flex items-center gap-3 p-2.5 rounded-lg transition-all"
                style={{
                  background: isCurrent ? config.color + '15' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isCurrent ? config.color + '40' : 'rgba(255,255,255,0.04)'}`,
                  opacity: isReached || isCurrent ? 1 : 0.5,
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{
                    background: config.color + '20',
                    color: config.color,
                  }}
                >
                  {config.minCombo}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-bold uppercase tracking-wide"
                    style={{ color: config.color }}
                  >
                    {config.label}
                  </div>
                  <div className="text-[10px] text-gray-500 truncate">
                    {config.description}
                  </div>
                </div>
                {isCurrent && (
                  <div
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                    style={{
                      background: config.color + '30',
                      color: config.color,
                    }}
                  >
                    Active
                  </div>
                )}
                {!isCurrent && isReached && tierIdx < currentIdx && (
                  <div className="text-[9px] text-gray-600 uppercase tracking-wider">
                    Reached
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const ComboRulesMenu = memo(ComboRulesMenuInner);
