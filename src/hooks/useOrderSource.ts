import type { Order, SimulationConfig } from '../types';
import { useOrderSimulator } from './useOrderSimulator';
import { useLightstepSource } from './useLightstepSource';

/**
 * Coordinator hook that delegates to the appropriate order source
 * based on the current source configuration.
 */
export function useOrderSource(
  config: SimulationConfig,
  onOrders: (orders: Order[]) => void
) {
  // Simulation source — only active when source type is 'simulation'
  useOrderSimulator(
    {
      ...config,
      isPlaying: config.isPlaying && config.source.type === 'simulation',
    },
    onOrders
  );

  // Lightstep source — only active when source type is 'lightstep'
  useLightstepSource(config, onOrders);
}
