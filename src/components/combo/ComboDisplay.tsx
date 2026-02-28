import { memo, useEffect, useRef } from 'react';
import { COMBO_TIERS } from '../../constants';
import type { ComboState } from '../../types';

interface Props {
  combo: ComboState;
}

function ComboDisplayInner({ combo }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  const tierConfig = COMBO_TIERS[combo.tier];
  const maxTierConfig = COMBO_TIERS[combo.maxTier];
  const decayFraction = combo.maxDecay > 0 ? combo.decayRemaining / combo.maxDecay : 0;

  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio;
      const size = canvas.offsetWidth;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.scale(dpr, dpr);

      const cx = size / 2;
      const cy = size / 2;
      const radius = size / 2 - 8;

      ctx.clearRect(0, 0, size, size);

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 4;
      ctx.stroke();

      if (combo.isActive && decayFraction > 0) {
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (Math.PI * 2 * decayFraction);

        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.strokeStyle = tierConfig.color;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.shadowColor = tierConfig.color;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [combo.isActive, decayFraction, tierConfig.color]);

  const labelLen = tierConfig.label.length;
  const labelTracking = labelLen > 14 ? '0.08em' : '0.2em';
  const labelSize = labelLen > 14 ? '9px' : '10px';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-2">
          <div
            className="text-4xl font-black tabular-nums transition-all duration-300"
            style={{
              color: combo.count > 0 ? tierConfig.color : 'rgba(255,255,255,0.2)',
              textShadow: combo.count > 0 ? `0 0 20px ${tierConfig.glowColor}` : 'none',
              transform: combo.count > 0 ? 'scale(1)' : 'scale(0.8)',
            }}
          >
            x{combo.count}
          </div>
          {combo.count > 0 && combo.tier !== 'none' && (
            <div
              className="font-bold uppercase mt-0.5 transition-all duration-300 text-center leading-tight max-w-full"
              style={{
                color: tierConfig.color,
                fontSize: labelSize,
                letterSpacing: labelTracking,
              }}
            >
              {tierConfig.label}
            </div>
          )}
        </div>
      </div>

      <div className="text-center space-y-1">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
          Combo Streak
        </div>
        {combo.maxCombo > 0 && (
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-gray-600">Best:</span>
            <span
              className="font-bold"
              style={{ color: maxTierConfig.color }}
            >
              x{combo.maxCombo}
            </span>
            {combo.maxTier !== 'none' && (
              <span
                className="uppercase tracking-wider font-semibold"
                style={{ color: maxTierConfig.color + 'aa' }}
              >
                {maxTierConfig.label}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export const ComboDisplay = memo(ComboDisplayInner);
