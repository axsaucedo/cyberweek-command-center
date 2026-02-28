import { useCallback, useEffect, useRef, useState } from 'react';
import type { ComboState, ComboTier } from '../types';
import { BASE_COMBO_DECAY_MS, MAX_COMBO_DECAY_MS, getTierForCombo } from '../constants';

type TierChangeCallback = (from: ComboTier, to: ComboTier) => void;
type ComboLostCallback = (count: number) => void;

export function useComboTracker(currentOPM: number) {
  const [combo, setCombo] = useState<ComboState>({
    count: 0,
    tier: 'none',
    lastOrderTime: 0,
    decayRemaining: 0,
    maxDecay: BASE_COMBO_DECAY_MS,
    isActive: false,
    maxCombo: 0,
    maxTier: 'none',
  });

  const tierChangeCbRef = useRef<TierChangeCallback | null>(null);
  const comboLostCbRef = useRef<ComboLostCallback | null>(null);
  const comboRef = useRef(combo);
  comboRef.current = combo;

  const onTierChange = useCallback((cb: TierChangeCallback) => {
    tierChangeCbRef.current = cb;
  }, []);

  const onComboLost = useCallback((cb: ComboLostCallback) => {
    comboLostCbRef.current = cb;
  }, []);

  const incrementCombo = useCallback((count: number) => {
    setCombo(prev => {
      const newCount = prev.count + count;
      const newTier = getTierForCombo(newCount);
      const now = Date.now();

      const opmFactor = Math.min(currentOPM / 1000, 1);
      const decayMs = BASE_COMBO_DECAY_MS + (MAX_COMBO_DECAY_MS - BASE_COMBO_DECAY_MS) * opmFactor;

      if (newTier !== prev.tier) {
        setTimeout(() => tierChangeCbRef.current?.(prev.tier, newTier), 0);
      }

      return {
        count: newCount,
        tier: newTier,
        lastOrderTime: now,
        decayRemaining: decayMs,
        maxDecay: decayMs,
        isActive: true,
        maxCombo: Math.max(prev.maxCombo, newCount),
        maxTier: getTierForCombo(Math.max(prev.maxCombo, newCount)),
      };
    });
  }, [currentOPM]);

  const resetCombo = useCallback(() => {
    setCombo({
      count: 0,
      tier: 'none',
      lastOrderTime: 0,
      decayRemaining: 0,
      maxDecay: BASE_COMBO_DECAY_MS,
      isActive: false,
      maxCombo: 0,
      maxTier: 'none',
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCombo(prev => {
        if (!prev.isActive || prev.count === 0) return prev;

        const newDecay = prev.decayRemaining - 50;
        if (newDecay <= 0) {
          setTimeout(() => comboLostCbRef.current?.(prev.count), 0);
          return {
            ...prev,
            count: 0,
            tier: 'none',
            decayRemaining: 0,
            isActive: false,
          };
        }

        return { ...prev, decayRemaining: newDecay };
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return { combo, incrementCombo, resetCombo, onTierChange, onComboLost };
}
