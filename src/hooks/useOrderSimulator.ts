import { useCallback, useEffect, useRef } from 'react';
import type { Order, SimulationConfig } from '../types';
import { generateOrder } from '../utils';

export function useOrderSimulator(
  config: SimulationConfig,
  onOrders: (orders: Order[]) => void
) {
  const configRef = useRef(config);
  configRef.current = config;

  const onOrdersRef = useRef(onOrders);
  onOrdersRef.current = onOrders;

  const batchRef = useRef<Order[]>([]);
  const rafRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const burstTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trendRef = useRef(0);
  const trendTargetRef = useRef(0);
  const trendChangeTimer = useRef(0);
  const noiseRef = useRef(0);

  const flush = useCallback(() => {
    if (batchRef.current.length > 0) {
      onOrdersRef.current([...batchRef.current]);
      batchRef.current = [];
    }
    rafRef.current = requestAnimationFrame(flush);
  }, []);

  useEffect(() => {
    if (!config.isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (burstTimeoutRef.current) clearTimeout(burstTimeoutRef.current);
      cancelAnimationFrame(rafRef.current);
      return;
    }

    rafRef.current = requestAnimationFrame(flush);

    const tickRate = 10;
    const tickMs = 1000 / tickRate;

    intervalRef.current = setInterval(() => {
      if (!configRef.current.isPlaying) return;

      const { ordersPerMinute, speedMultiplier, volatility, trendRange } = configRef.current;
      const baseOPM = ordersPerMinute * speedMultiplier;

      trendChangeTimer.current -= tickMs;
      if (trendChangeTimer.current <= 0) {
        trendTargetRef.current = (Math.random() * 2 - 1) * trendRange;
        trendChangeTimer.current = 2000 + Math.random() * 8000;
      }
      trendRef.current += (trendTargetRef.current - trendRef.current) * 0.02;

      noiseRef.current = (Math.random() * 2 - 1) * volatility * 0.5;

      const modifier = 1 + trendRef.current + noiseRef.current;
      const effectiveOPM = Math.max(0, baseOPM * modifier);
      const ordersPerTick = effectiveOPM / 60 / tickRate;

      const whole = Math.floor(ordersPerTick);
      const fractional = ordersPerTick - whole;

      for (let i = 0; i < whole; i++) {
        batchRef.current.push(generateOrder());
      }
      if (Math.random() < fractional) {
        batchRef.current.push(generateOrder());
      }
    }, tickMs);

    const scheduleBurst = () => {
      if (!configRef.current.burstMode || !configRef.current.isPlaying) return;
      const delay = 5000 + Math.random() * 15000;
      burstTimeoutRef.current = setTimeout(() => {
        if (configRef.current.isPlaying && configRef.current.burstMode) {
          const burstSize = 10 + Math.floor(Math.random() * 40);
          for (let i = 0; i < burstSize; i++) {
            batchRef.current.push(generateOrder());
          }
        }
        scheduleBurst();
      }, delay);
    };

    if (config.burstMode) scheduleBurst();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (burstTimeoutRef.current) clearTimeout(burstTimeoutRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, [config.isPlaying, config.ordersPerMinute, config.speedMultiplier, config.burstMode, config.volatility, config.trendRange, flush]);
}
