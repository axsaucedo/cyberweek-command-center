import { memo } from 'react';
import {
  Play, Pause, Zap,
  RotateCcw, ChevronUp, ChevronDown, Sparkles, Target,
  TrendingUp, Activity, BarChart3, LineChart, Scale,
} from 'lucide-react';
import type { SimulationConfig, SoundConfig, EffectsConfig } from '../../types';

interface Props {
  simulation: SimulationConfig;
  sound: SoundConfig;
  effects: EffectsConfig;
  visible: boolean;
  tierBgColor: string;
  onSimulationChange: (config: SimulationConfig) => void;
  onSoundChange: (config: SoundConfig) => void;
  onEffectsChange: (config: EffectsConfig) => void;
  onReset: () => void;
  onToggleVisible: () => void;
}

const SPEED_PRESETS = [0.5, 1, 2, 5, 10, 20];
const RATE_PRESETS = [100, 500, 1000, 5000, 10000];
const FORECAST_PRESETS = [100, 500, 1000, 2000, 5000];

function ControlsDockInner({
  simulation, sound, effects, visible, tierBgColor,
  onSimulationChange, onSoundChange, onEffectsChange, onReset, onToggleVisible,
}: Props) {
  return (
    <div className="relative">
      <button
        onClick={onToggleVisible}
        className="absolute -top-8 right-4 bg-gray-800/80 hover:bg-gray-700/80 text-gray-400 hover:text-white px-4 py-1 rounded-t-lg text-xs flex items-center gap-1 transition-colors backdrop-blur-sm"
      >
        Settings {visible ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
      </button>

      <div
        className="transition-all duration-1000 overflow-hidden backdrop-blur-md"
        style={{
          maxHeight: visible ? 320 : 0,
          background: tierBgColor,
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="p-4 flex items-start gap-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSimulationChange({ ...simulation, isPlaying: !simulation.isPlaying })}
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200"
              style={{
                background: simulation.isPlaying
                  ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                  : 'linear-gradient(135deg, #22c55e, #16a34a)',
                boxShadow: simulation.isPlaying
                  ? '0 0 20px rgba(239,68,68,0.3)'
                  : '0 0 20px rgba(34,197,94,0.3)',
              }}
            >
              {simulation.isPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white ml-0.5" />}
            </button>
            <button
              onClick={onReset}
              className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1.5 flex items-center justify-between">
                  <span>Speed</span>
                  <span className="text-gray-300">{simulation.speedMultiplier}x</span>
                </div>
                <div className="flex gap-1">
                  {SPEED_PRESETS.map(s => (
                    <button
                      key={s}
                      onClick={() => onSimulationChange({ ...simulation, speedMultiplier: s })}
                      className="flex-1 py-1 px-1.5 rounded text-xs font-medium transition-all"
                      style={{
                        background: simulation.speedMultiplier === s ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)',
                        color: simulation.speedMultiplier === s ? '#93c5fd' : '#9ca3af',
                        border: `1px solid ${simulation.speedMultiplier === s ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      }}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1.5 flex items-center justify-between">
                  <span>Orders/min</span>
                  <span className="text-gray-300">{simulation.ordersPerMinute.toLocaleString()}</span>
                </div>
                <div className="flex gap-1">
                  {RATE_PRESETS.map(r => (
                    <button
                      key={r}
                      onClick={() => onSimulationChange({ ...simulation, ordersPerMinute: r })}
                      className="flex-1 py-1 px-1 rounded text-xs font-medium transition-all"
                      style={{
                        background: simulation.ordersPerMinute === r ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)',
                        color: simulation.ordersPerMinute === r ? '#93c5fd' : '#9ca3af',
                        border: `1px solid ${simulation.ordersPerMinute === r ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      }}
                    >
                      {r >= 1000 ? `${r / 1000}K` : r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Target size={10} />
                    Forecast OPM
                  </span>
                  <span className="text-gray-300">
                    {simulation.forecastEnabled ? simulation.forecastOPM.toLocaleString() : 'OFF'}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => onSimulationChange({ ...simulation, forecastEnabled: !simulation.forecastEnabled })}
                    className="py-1 px-2 rounded text-xs font-medium transition-all"
                    style={{
                      background: simulation.forecastEnabled ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.05)',
                      color: simulation.forecastEnabled ? '#fbbf24' : '#6b7280',
                      border: `1px solid ${simulation.forecastEnabled ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    }}
                  >
                    {simulation.forecastEnabled ? 'ON' : 'OFF'}
                  </button>
                  {FORECAST_PRESETS.map(f => (
                    <button
                      key={f}
                      onClick={() => onSimulationChange({ ...simulation, forecastOPM: f, forecastEnabled: true })}
                      className="flex-1 py-1 px-1 rounded text-xs font-medium transition-all"
                      style={{
                        background: simulation.forecastEnabled && simulation.forecastOPM === f ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.05)',
                        color: simulation.forecastEnabled && simulation.forecastOPM === f ? '#fbbf24' : '#9ca3af',
                        border: `1px solid ${simulation.forecastEnabled && simulation.forecastOPM === f ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.08)'}`,
                        opacity: simulation.forecastEnabled ? 1 : 0.5,
                      }}
                      disabled={!simulation.forecastEnabled}
                    >
                      {f >= 1000 ? `${f / 1000}K` : f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1" style={{ maxWidth: 180, opacity: simulation.forecastEnabled ? 1 : 0.4 }}>
                <div className="text-xs text-gray-500 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Scale size={10} />
                    Weight
                  </span>
                  <span className="text-gray-300">
                    {simulation.forecastWeight > 0 ? '+' : ''}{Math.round(simulation.forecastWeight * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={-80}
                  max={80}
                  value={simulation.forecastWeight * 100}
                  onChange={(e) => onSimulationChange({ ...simulation, forecastWeight: Number(e.target.value) / 100 })}
                  className="w-full h-1 accent-amber-500"
                  disabled={!simulation.forecastEnabled}
                />
              </div>

              <div className="flex items-center">
                <div className="text-xs text-gray-500 mr-2">Chart</div>
                <div className="flex gap-1">
                  <button
                    onClick={() => onSimulationChange({ ...simulation, chartMode: 'net' })}
                    className="flex items-center gap-1 py-1 px-2 rounded text-xs font-medium transition-all"
                    style={{
                      background: simulation.chartMode === 'net' ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)',
                      color: simulation.chartMode === 'net' ? '#93c5fd' : '#6b7280',
                      border: `1px solid ${simulation.chartMode === 'net' ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    }}
                  >
                    <LineChart size={10} />
                    Net
                  </button>
                  <button
                    onClick={() => onSimulationChange({ ...simulation, chartMode: 'cumulative' })}
                    className="flex items-center gap-1 py-1 px-2 rounded text-xs font-medium transition-all"
                    style={{
                      background: simulation.chartMode === 'cumulative' ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)',
                      color: simulation.chartMode === 'cumulative' ? '#93c5fd' : '#6b7280',
                      border: `1px solid ${simulation.chartMode === 'cumulative' ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    }}
                  >
                    <BarChart3 size={10} />
                    Sum
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Activity size={10} />
                    Volatility
                  </span>
                  <span className="text-gray-300">{Math.round(simulation.volatility * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={200}
                  value={simulation.volatility * 100}
                  onChange={(e) => onSimulationChange({ ...simulation, volatility: Number(e.target.value) / 100 })}
                  className="w-full h-1 accent-cyan-500"
                />
              </div>

              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <TrendingUp size={10} />
                    Trend Range
                  </span>
                  <span className="text-gray-300">{Math.round(simulation.trendRange * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={200}
                  value={simulation.trendRange * 100}
                  onChange={(e) => onSimulationChange({ ...simulation, trendRange: Number(e.target.value) / 100 })}
                  className="w-full h-1 accent-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => onSimulationChange({ ...simulation, burstMode: !simulation.burstMode })}
                  className="w-8 h-4 rounded-full relative transition-colors cursor-pointer"
                  style={{
                    background: simulation.burstMode ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.1)',
                  }}
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full absolute top-0.5 transition-all"
                    style={{
                      left: simulation.burstMode ? 16 : 2,
                      background: simulation.burstMode ? '#f59e0b' : '#6b7280',
                    }}
                  />
                </div>
                <Zap size={12} className={simulation.burstMode ? 'text-amber-400' : 'text-gray-500'} />
                <span className="text-xs text-gray-400">Burst</span>
              </label>

              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-gray-400" />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={effects.intensity * 100}
                  onChange={(e) => onEffectsChange({ intensity: Number(e.target.value) / 100 })}
                  className="w-20 h-1 accent-teal-500"
                />
                <span className="text-xs text-gray-500">FX</span>
              </div>

              <div className="flex items-center gap-1.5 ml-auto">
                {(['orderSounds', 'comboSounds', 'milestoneSounds'] as const).map(key => {
                  const labels = { orderSounds: 'Orders', comboSounds: 'Combos', milestoneSounds: 'Milestones' };
                  return (
                    <button
                      key={key}
                      onClick={() => onSoundChange({ ...sound, [key]: !sound[key] })}
                      className="px-2 py-0.5 rounded text-xs transition-all"
                      style={{
                        background: sound[key] ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                        color: sound[key] ? '#93c5fd' : '#6b7280',
                        border: `1px solid ${sound[key] ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      }}
                    >
                      {labels[key]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ControlsDock = memo(ControlsDockInner);
