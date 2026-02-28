import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ComboTier, DashboardStats, EffectsConfig, Milestone,
  Order, SimulationConfig, SoundConfig,
} from '../../types';
import { COMBO_TIERS, ORDER_MILESTONES, REVENUE_MILESTONES, VELOCITY_MILESTONES, getTierIndex } from '../../constants';
import { useOrderSimulator } from '../../hooks/useOrderSimulator';
import { useComboTracker } from '../../hooks/useComboTracker';
import { soundEngine } from '../../audio/SoundEngine';
import { particleEngine } from '../../animations/ParticleEngine';

import { ParticleCanvas } from '../particles/ParticleCanvas';
import { TopBar } from './TopBar';
import { StatsBar } from './StatsBar';
import { VelocityChart } from '../chart/VelocityChart';
import { BubbleOverlay } from '../bubbles/BubbleOverlay';
import { ComboDisplay } from '../combo/ComboDisplay';
import { ComboRulesMenu } from '../combo/ComboRulesMenu';
import { OrderFeed } from '../feed/OrderFeed';
import { ControlsDock } from '../controls/ControlsDock';
import { TierAnnouncement } from '../celebrations/TierAnnouncement';
import { MilestoneOverlay } from '../celebrations/MilestoneOverlay';
import { ComboLostFlash } from '../celebrations/ComboLostFlash';

const CHART_WINDOW_SECONDS = 120;

interface TierAnnouncementData {
  id: number;
  tier: ComboTier;
  combo: number;
}

export function Dashboard() {
  const [simulation, setSimulation] = useState<SimulationConfig>({
    ordersPerMinute: 500,
    speedMultiplier: 1,
    isPlaying: false,
    burstMode: false,
    forecastEnabled: false,
    forecastOPM: 500,
    volatility: 0.3,
    trendRange: 0.4,
  });

  const [soundConfig, setSoundConfig] = useState<SoundConfig>({
    enabled: true,
    masterVolume: 0.5,
    orderSounds: true,
    comboSounds: true,
    milestoneSounds: true,
  });

  const [effectsConfig, setEffectsConfig] = useState<EffectsConfig>({ intensity: 0.8 });
  const [controlsVisible, setControlsVisible] = useState(true);

  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    currentOPM: 0,
    peakOPM: 0,
    sessionStart: 0,
    forecastRevenue: 0,
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [chartBuckets, setChartBuckets] = useState<number[]>([]);
  const [tierAnnouncement, setTierAnnouncement] = useState<TierAnnouncementData | null>(null);
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [comboLostTrigger, setComboLostTrigger] = useState(0);
  const [comboLostCount, setComboLostCount] = useState(0);
  const [rulesOpen, setRulesOpen] = useState(false);

  const bucketMapRef = useRef<Map<number, number>>(new Map());
  const statsRef = useRef(stats);
  statsRef.current = stats;

  const recentOrderCountsRef = useRef<number[]>([]);
  const hitMilestonesRef = useRef<Set<string>>(new Set());
  const announcementIdRef = useRef(0);
  const milestoneIdRef = useRef(0);

  const { combo, incrementCombo, resetCombo, onTierChange, onComboLost } = useComboTracker(stats.currentOPM);

  useEffect(() => {
    soundEngine.setConfig(soundConfig);
  }, [soundConfig]);

  useEffect(() => {
    particleEngine.setIntensity(effectsConfig.intensity);
  }, [effectsConfig.intensity]);

  useEffect(() => {
    soundEngine.setThrottle(stats.currentOPM);
  }, [stats.currentOPM]);

  useEffect(() => {
    onTierChange((from, to) => {
      const fromIdx = getTierIndex(from);
      const toIdx = getTierIndex(to);
      if (toIdx < fromIdx) {
        soundEngine.playComboTierUp(COMBO_TIERS[to].particleIntensity * 6 | 0);
        announcementIdRef.current++;
        setTierAnnouncement({
          id: announcementIdRef.current,
          tier: to,
          combo: combo.count,
        });

        const colors = [COMBO_TIERS[to].color, '#fff', '#fbbf24', '#f472b6'];
        particleEngine.emitConfettiRain(Math.ceil(20 * effectsConfig.intensity), colors);
      }
    });
  }, [onTierChange, combo.count, effectsConfig.intensity]);

  useEffect(() => {
    onComboLost((count) => {
      soundEngine.playComboLost();
      setComboLostCount(count);
      setComboLostTrigger(prev => prev + 1);
    });
  }, [onComboLost]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const counts = recentOrderCountsRef.current;
      const oneMinAgo = now - 60;
      const recentSum = counts.filter((_, i) => {
        const t = now - (counts.length - 1 - i);
        return t >= oneMinAgo;
      }).reduce((a, b) => a + b, 0);

      setStats(prev => ({
        ...prev,
        currentOPM: recentSum,
        peakOPM: Math.max(prev.peakOPM, recentSum),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const buckets: number[] = [];
      for (let i = 0; i < CHART_WINDOW_SECONDS; i++) {
        const t = now - (CHART_WINDOW_SECONDS - 1 - i);
        buckets.push(bucketMapRef.current.get(t) || 0);
      }
      setChartBuckets(buckets);

      const cutoff = now - CHART_WINDOW_SECONDS - 60;
      for (const key of bucketMapRef.current.keys()) {
        if (key < cutoff) bucketMapRef.current.delete(key);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const checkMilestones = useCallback((totalOrders: number, totalRevenue: number, currentOPM: number) => {
    for (const m of ORDER_MILESTONES) {
      const key = `orders-${m}`;
      if (totalOrders >= m && !hitMilestonesRef.current.has(key)) {
        hitMilestonesRef.current.add(key);
        milestoneIdRef.current++;
        setMilestone({
          id: `ms-${milestoneIdRef.current}`,
          type: 'orders',
          label: `${m.toLocaleString()} ORDERS`,
          value: m,
          timestamp: Date.now(),
        });
        soundEngine.playMilestone();
        particleEngine.emitConfettiRain(40, ['#3b82f6', '#60a5fa', '#93c5fd', '#fff']);
        return;
      }
    }
    for (const m of REVENUE_MILESTONES) {
      const key = `revenue-${m}`;
      if (totalRevenue >= m && !hitMilestonesRef.current.has(key)) {
        hitMilestonesRef.current.add(key);
        milestoneIdRef.current++;
        const label = m >= 1000000 ? `$${m / 1000000}M REVENUE` : m >= 1000 ? `$${m / 1000}K REVENUE` : `$${m} REVENUE`;
        setMilestone({
          id: `ms-${milestoneIdRef.current}`,
          type: 'revenue',
          label,
          value: m,
          timestamp: Date.now(),
        });
        soundEngine.playMilestone();
        particleEngine.emitConfettiRain(40, ['#22c55e', '#4ade80', '#86efac', '#fff']);
        return;
      }
    }
    for (const m of VELOCITY_MILESTONES) {
      const key = `velocity-${m}`;
      if (currentOPM >= m && !hitMilestonesRef.current.has(key)) {
        hitMilestonesRef.current.add(key);
        milestoneIdRef.current++;
        setMilestone({
          id: `ms-${milestoneIdRef.current}`,
          type: 'velocity',
          label: `${m.toLocaleString()} OPM`,
          value: m,
          timestamp: Date.now(),
        });
        soundEngine.playMilestone();
        particleEngine.emitConfettiRain(40, ['#f59e0b', '#fbbf24', '#fde68a', '#fff']);
        return;
      }
    }
  }, []);

  const handleOrders = useCallback((orders: Order[]) => {
    const now = Math.floor(Date.now() / 1000);
    bucketMapRef.current.set(now, (bucketMapRef.current.get(now) || 0) + orders.length);

    while (recentOrderCountsRef.current.length > 120) {
      recentOrderCountsRef.current.shift();
    }
    const lastIdx = recentOrderCountsRef.current.length - 1;
    if (lastIdx >= 0) {
      recentOrderCountsRef.current[lastIdx] += orders.length;
    } else {
      recentOrderCountsRef.current.push(orders.length);
    }

    const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);
    incrementCombo(orders.length);

    setStats(prev => {
      const newStats = {
        ...prev,
        totalOrders: prev.totalOrders + orders.length,
        totalRevenue: prev.totalRevenue + totalRevenue,
        sessionStart: prev.sessionStart || Date.now(),
      };
      checkMilestones(newStats.totalOrders, newStats.totalRevenue, newStats.currentOPM);
      return newStats;
    });

    setRecentOrders(orders);

    for (const order of orders) {
      if (order.amount > 200) {
        soundEngine.playHighValueOrder();
      } else {
        soundEngine.playOrderTick(order.amount);
      }
    }
  }, [incrementCombo, checkMilestones]);

  useOrderSimulator(simulation, handleOrders);

  const handleReset = useCallback(() => {
    setSimulation(prev => ({ ...prev, isPlaying: false }));
    setStats({
      totalOrders: 0,
      totalRevenue: 0,
      currentOPM: 0,
      peakOPM: 0,
      sessionStart: 0,
      forecastRevenue: 0,
    });
    setRecentOrders([]);
    setChartBuckets([]);
    resetCombo();
    bucketMapRef.current.clear();
    recentOrderCountsRef.current = [];
    hitMilestonesRef.current.clear();
  }, [resetCombo]);

  const handleToggleMute = useCallback(() => {
    setSoundConfig(prev => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setSimulation(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
      }
      if (e.code === 'KeyM') {
        setSoundConfig(prev => ({ ...prev, enabled: !prev.enabled }));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const last = recentOrderCountsRef.current;
      if (last.length === 0 || (last.length > 0 && last[last.length - 1] !== undefined)) {
        recentOrderCountsRef.current.push(0);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="h-screen flex flex-col overflow-hidden transition-colors duration-1000"
      style={{ background: COMBO_TIERS[combo.tier].bgColor }}
    >
      <ParticleCanvas />
      <TierAnnouncement announcement={tierAnnouncement} />
      <MilestoneOverlay milestone={milestone} />
      <ComboLostFlash trigger={comboLostTrigger} lostCount={comboLostCount} />
      <ComboRulesMenu
        isOpen={rulesOpen}
        onClose={() => setRulesOpen(false)}
        currentTier={combo.tier}
        maxTier={combo.maxTier}
        maxCombo={combo.maxCombo}
      />

      <TopBar
        isPlaying={simulation.isPlaying}
        sessionStart={stats.sessionStart}
        stats={stats}
        soundConfig={soundConfig}
        onOpenRules={() => setRulesOpen(true)}
        onToggleMute={handleToggleMute}
      />

      <div className="flex-1 flex flex-col p-4 gap-4 min-h-0">
        <StatsBar
          stats={stats}
          tier={combo.tier}
          forecastEnabled={simulation.forecastEnabled}
          forecastOPM={simulation.forecastOPM}
        />

        <div className="flex-1 flex gap-4 min-h-0">
          <div
            className="flex-[7] relative rounded-xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <VelocityChart
              buckets={chartBuckets}
              maxBuckets={CHART_WINDOW_SECONDS}
              tier={combo.tier}
              effectsIntensity={effectsConfig.intensity}
              forecastEnabled={simulation.forecastEnabled}
              forecastOPM={simulation.forecastOPM}
            />
            <BubbleOverlay
              orders={recentOrders}
              intensity={effectsConfig.intensity}
            />
          </div>

          <div className="flex-[3] flex flex-col gap-4 min-h-0">
            <div
              className="rounded-xl p-4 flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <ComboDisplay combo={combo} />
            </div>

            <div
              className="flex-1 rounded-xl p-3 min-h-0 overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <OrderFeed orders={recentOrders} totalOrders={stats.totalOrders} />
            </div>
          </div>
        </div>
      </div>

      <ControlsDock
        simulation={simulation}
        sound={soundConfig}
        effects={effectsConfig}
        visible={controlsVisible}
        onSimulationChange={setSimulation}
        onSoundChange={setSoundConfig}
        onEffectsChange={setEffectsConfig}
        onReset={handleReset}
        onToggleVisible={() => setControlsVisible(v => !v)}
      />
    </div>
  );
}
