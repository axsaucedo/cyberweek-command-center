import { useCallback, useEffect, useRef } from 'react';
import type { Order, SimulationConfig } from '../types';
import { generateOrder } from '../utils';

/**
 * Polls the Python backend /api/rpm endpoint for Lightstep OPM-by-country data,
 * then converts aggregate OPM counts into individual Order objects with random enrichment.
 * Orders are distributed across the poll interval for smooth animation.
 */
export function useLightstepSource(
  config: SimulationConfig,
  onOrders: (orders: Order[]) => void
) {
  const configRef = useRef(config);
  configRef.current = config;

  const onOrdersRef = useRef(onOrders);
  onOrdersRef.current = onOrders;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const emitIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingOrdersRef = useRef<number>(0);
  const batchRef = useRef<Order[]>([]);
  const rafRef = useRef<number>(0);

  const flush = useCallback(() => {
    if (batchRef.current.length > 0) {
      onOrdersRef.current([...batchRef.current]);
      batchRef.current = [];
    }
    rafRef.current = requestAnimationFrame(flush);
  }, []);

  useEffect(() => {
    const isActive = config.isPlaying && config.source.type === 'lightstep';

    if (!isActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (emitIntervalRef.current) clearInterval(emitIntervalRef.current);
      cancelAnimationFrame(rafRef.current);
      pendingOrdersRef.current = 0;
      return;
    }

    rafRef.current = requestAnimationFrame(flush);

    const fetchOPM = async () => {
      try {
        const res = await fetch('/api/rpm');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Record<string, number> = await res.json();

        // Sum all OPM across countries
        const totalOPM = Object.values(data).reduce((sum, v) => sum + v, 0);
        pendingOrdersRef.current = totalOPM;
      } catch {
        // Error is handled by the status indicator — don't crash
        pendingOrdersRef.current = 0;
      }
    };

    // Initial fetch
    fetchOPM();
    // Poll every 15 seconds
    intervalRef.current = setInterval(fetchOPM, 15000);

    // Emit orders smoothly across the interval (10 ticks/second)
    const tickRate = 10;
    const tickMs = 1000 / tickRate;
    emitIntervalRef.current = setInterval(() => {
      if (pendingOrdersRef.current <= 0) return;

      // Distribute orders across 60 seconds (since OPM = orders per minute)
      const ordersPerTick = pendingOrdersRef.current / 60 / tickRate;

      const whole = Math.floor(ordersPerTick);
      const fractional = ordersPerTick - whole;

      for (let i = 0; i < whole; i++) {
        batchRef.current.push(generateOrder());
      }
      if (Math.random() < fractional) {
        batchRef.current.push(generateOrder());
      }
    }, tickMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (emitIntervalRef.current) clearInterval(emitIntervalRef.current);
      cancelAnimationFrame(rafRef.current);
      pendingOrdersRef.current = 0;
    };
  }, [config.isPlaying, config.source.type, flush]);
}
