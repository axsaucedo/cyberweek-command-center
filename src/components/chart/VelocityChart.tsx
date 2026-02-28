import { memo, useCallback, useEffect, useRef } from 'react';
import { COMBO_TIERS } from '../../constants';
import type { ComboTier } from '../../types';
import { particleEngine } from '../../animations/ParticleEngine';

interface Props {
  buckets: number[];
  maxBuckets: number;
  tier: ComboTier;
  effectsIntensity: number;
  forecastEnabled: boolean;
  forecastOPM: number;
}

function VelocityChartInner({ buckets, maxBuckets, tier, effectsIntensity, forecastEnabled, forecastOPM }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef(0);
  const displayBucketsRef = useRef<number[]>([]);
  const targetBucketsRef = useRef<number[]>([]);
  const lastSparkTime = useRef(0);
  const lastIconTime = useRef(0);

  targetBucketsRef.current = buckets;

  const tierConfig = COMBO_TIERS[tier];
  const forecastPerSecond = forecastOPM / 60;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const display = displayBucketsRef.current;
    const target = targetBucketsRef.current;

    while (display.length < target.length) display.push(0);
    if (display.length > target.length) display.length = target.length;
    for (let i = 0; i < target.length; i++) {
      display[i] += (target[i] - display[i]) * 0.15;
    }

    const maxVal = Math.max(5, ...display, forecastEnabled ? forecastPerSecond * 1.5 : 0) * 1.2;
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartH / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '11px system-ui';
      ctx.textAlign = 'right';
      const val = Math.round(maxVal * (1 - i / gridLines));
      ctx.fillText(String(val), padding.left - 8, y + 4);
    }

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'center';
    const labelCount = Math.min(6, display.length);
    const step = Math.floor(display.length / labelCount) || 1;
    for (let i = 0; i < display.length; i += step) {
      const x = padding.left + (i / Math.max(1, display.length - 1)) * chartW;
      const secsAgo = (display.length - 1 - i);
      const label = secsAgo === 0 ? 'now' : `-${secsAgo}s`;
      ctx.fillText(label, x, h - 8);
    }

    if (forecastEnabled && forecastPerSecond > 0) {
      const startFraction = 0.3;
      const startVal = forecastPerSecond * startFraction;
      const endVal = forecastPerSecond;
      const startY = padding.top + chartH - (startVal / maxVal) * chartH;
      const endY = padding.top + chartH - (endVal / maxVal) * chartH;

      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padding.left, startY);
      ctx.lineTo(w - padding.right, endY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(251, 191, 36, 0.7)';
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText('FORECAST', w - padding.right - 4, endY - 5);
    }

    if (display.length < 2) {
      animFrameRef.current = requestAnimationFrame(draw);
      return;
    }

    const points: [number, number][] = display.map((val, i) => [
      padding.left + (i / (maxBuckets - 1)) * chartW,
      padding.top + chartH - (val / maxVal) * chartH,
    ]);

    const lastVal = display[display.length - 1] || 0;
    const isAboveForecast = forecastEnabled && lastVal >= forecastPerSecond;
    const lineColor = forecastEnabled
      ? (isAboveForecast ? '#22c55e' : '#ef4444')
      : tierConfig.color;

    if (forecastEnabled && forecastPerSecond > 0) {
      const startFraction = 0.3;

      const forecastPoints: [number, number][] = display.map((_, i) => {
        const t = i / Math.max(1, maxBuckets - 1);
        const forecastAtT = forecastPerSecond * (startFraction + (1 - startFraction) * t);
        return [
          padding.left + t * chartW,
          padding.top + chartH - (forecastAtT / maxVal) * chartH,
        ];
      });

      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < forecastPoints.length; i++) {
        const [fx, fy] = forecastPoints[i];
        if (i === 0) ctx.moveTo(fx, fy);
        else ctx.lineTo(fx, fy);
      }
      ctx.lineTo(w - padding.right, padding.top);
      ctx.lineTo(padding.left, padding.top);
      ctx.closePath();
      ctx.clip();

      const aboveGradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
      aboveGradient.addColorStop(0, 'rgba(34, 197, 94, 0.25)');
      aboveGradient.addColorStop(1, 'rgba(34, 197, 94, 0.02)');

      ctx.beginPath();
      ctx.moveTo(points[0][0], forecastPoints[0][1]);
      ctx.lineTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpx = (prev[0] + curr[0]) / 2;
        ctx.bezierCurveTo(cpx, prev[1], cpx, curr[1], curr[0], curr[1]);
      }
      ctx.lineTo(points[points.length - 1][0], forecastPoints[forecastPoints.length - 1][1]);
      ctx.closePath();
      ctx.fillStyle = aboveGradient;
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < forecastPoints.length; i++) {
        const [fx, fy] = forecastPoints[i];
        if (i === 0) ctx.moveTo(fx, fy);
        else ctx.lineTo(fx, fy);
      }
      ctx.lineTo(w - padding.right, padding.top + chartH);
      ctx.lineTo(padding.left, padding.top + chartH);
      ctx.closePath();
      ctx.clip();

      const belowGradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
      belowGradient.addColorStop(0, 'rgba(239, 68, 68, 0.02)');
      belowGradient.addColorStop(1, 'rgba(239, 68, 68, 0.15)');

      ctx.beginPath();
      ctx.moveTo(points[0][0], forecastPoints[0][1]);
      ctx.lineTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpx = (prev[0] + curr[0]) / 2;
        ctx.bezierCurveTo(cpx, prev[1], cpx, curr[1], curr[0], curr[1]);
      }
      ctx.lineTo(points[points.length - 1][0], forecastPoints[forecastPoints.length - 1][1]);
      ctx.closePath();
      ctx.fillStyle = belowGradient;
      ctx.fill();
      ctx.restore();
    } else {
      const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
      gradient.addColorStop(0, tierConfig.color + 'cc');
      gradient.addColorStop(0.5, tierConfig.color + '40');
      gradient.addColorStop(1, tierConfig.color + '05');

      ctx.beginPath();
      ctx.moveTo(points[0][0], padding.top + chartH);
      ctx.lineTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpx = (prev[0] + curr[0]) / 2;
        ctx.bezierCurveTo(cpx, prev[1], cpx, curr[1], curr[0], curr[1]);
      }
      ctx.lineTo(points[points.length - 1][0], padding.top + chartH);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev[0] + curr[0]) / 2;
      ctx.bezierCurveTo(cpx, prev[1], cpx, curr[1], curr[0], curr[1]);
    }
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = lineColor;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    const lastPoint = points[points.length - 1];
    if (lastPoint) {
      ctx.beginPath();
      ctx.arc(lastPoint[0], lastPoint[1], 5, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.shadowColor = lineColor;
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      const trailGradient = ctx.createRadialGradient(
        lastPoint[0], lastPoint[1], 0,
        lastPoint[0], lastPoint[1], 30
      );
      trailGradient.addColorStop(0, lineColor + '60');
      trailGradient.addColorStop(1, lineColor + '00');
      ctx.beginPath();
      ctx.arc(lastPoint[0], lastPoint[1], 30, 0, Math.PI * 2);
      ctx.fillStyle = trailGradient;
      ctx.fill();

      const now = Date.now();
      const currentVal = display[display.length - 1] || 0;

      if (currentVal > 0 && effectsIntensity > 0 && now - lastSparkTime.current > 100) {
        lastSparkTime.current = now;
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const screenX = rect.left + lastPoint[0];
          const screenY = rect.top + lastPoint[1];
          const sparkCount = Math.ceil(Math.min(currentVal, 5) * effectsIntensity);
          particleEngine.emitSparks(screenX, screenY, sparkCount, lineColor);
        }
      }

      if (currentVal > 0 && effectsIntensity > 0 && now - lastIconTime.current > 300) {
        lastIconTime.current = now;
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const screenX = rect.left + lastPoint[0];
          const screenY = rect.top + lastPoint[1];
          const count = Math.ceil(Math.min(currentVal / 2, 3) * effectsIntensity);
          particleEngine.emitEmbers(screenX, screenY, count, lineColor);
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(draw);
  }, [maxBuckets, tierConfig, effectsIntensity, forecastEnabled, forecastPerSecond]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [draw]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

export const VelocityChart = memo(VelocityChartInner);
