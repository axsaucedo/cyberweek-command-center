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
  forecastWeight: number;
  chartMode: 'net' | 'cumulative';
  speedMultiplier: number;
}

function safeMax(arr: number[], fallback: number): number {
  let max = fallback;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i];
  }
  return max;
}

function VelocityChartInner({
  buckets, maxBuckets, tier, effectsIntensity,
  forecastEnabled, forecastOPM, forecastWeight, chartMode, speedMultiplier,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef(0);
  const lastSparkTime = useRef(0);
  const lastIconTime = useRef(0);

  const bucketsRef = useRef(buckets);
  bucketsRef.current = buckets;

  const tierConfig = COMBO_TIERS[tier];
  const forecastPerSecond = (forecastOPM * speedMultiplier) / 60;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    if (w === 0 || h === 0) {
      animFrameRef.current = requestAnimationFrame(draw);
      return;
    }
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const rawBuckets = bucketsRef.current;

    let firstNonZero = -1;
    for (let i = 0; i < rawBuckets.length; i++) {
      if (rawBuckets[i] > 0) { firstNonZero = i; break; }
    }

    let displayData: number[];
    if (chartMode === 'cumulative') {
      displayData = [];
      let sum = 0;
      for (const v of rawBuckets) {
        sum += v;
        displayData.push(sum);
      }
    } else {
      displayData = [...rawBuckets];
    }

    const dataStart = firstNonZero >= 0 ? firstNonZero : displayData.length;
    const dataLen = displayData.length - dataStart;

    const weightMultiplier = 1 + forecastWeight;
    let forecastLine: number[] = [];
    if (forecastEnabled && forecastPerSecond > 0 && dataLen > 0) {
      const weightedFPS = forecastPerSecond * weightMultiplier;
      if (chartMode === 'cumulative') {
        forecastLine = new Array(dataStart).fill(0);
        for (let i = dataStart; i < displayData.length; i++) {
          const elapsed = i - dataStart + 1;
          forecastLine.push(elapsed * weightedFPS);
        }
      } else {
        forecastLine = new Array(dataStart).fill(0);
        for (let i = dataStart; i < displayData.length; i++) {
          forecastLine.push(weightedFPS);
        }
      }
    }

    const maxVal = Math.max(5, safeMax(displayData, 0), safeMax(forecastLine, 0)) * 1.15;
    const padding = { top: 20, right: 20, bottom: 30, left: 55 };
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
      const label = val >= 1000 ? `${(val / 1000).toFixed(1)}K` : String(val);
      ctx.fillText(label, padding.left - 8, y + 4);
    }

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'center';
    const totalBuckets = Math.max(1, maxBuckets - 1);
    const labelStep = Math.max(1, Math.floor(maxBuckets / 6));
    for (let i = 0; i < maxBuckets; i += labelStep) {
      const x = padding.left + (i / totalBuckets) * chartW;
      const secsAgo = maxBuckets - 1 - i;
      const lbl = secsAgo === 0 ? 'now' : `${secsAgo}s`;
      ctx.fillText(lbl, x, h - 8);
    }
    {
      const x = padding.left + chartW;
      ctx.fillText('now', x, h - 8);
    }

    if (displayData.length < 2 || dataLen < 1) {
      animFrameRef.current = requestAnimationFrame(draw);
      return;
    }

    const toX = (i: number) => padding.left + (i / totalBuckets) * chartW;
    const toY = (val: number) => padding.top + chartH - (val / maxVal) * chartH;

    if (forecastLine.length > dataStart + 1) {
      const fPoints: [number, number][] = [];
      for (let i = dataStart; i < forecastLine.length; i++) {
        fPoints.push([toX(i), toY(forecastLine[i])]);
      }

      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < fPoints.length; i++) {
        if (i === 0) ctx.moveTo(fPoints[i][0], fPoints[i][1]);
        else ctx.lineTo(fPoints[i][0], fPoints[i][1]);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      const lastFP = fPoints[fPoints.length - 1];
      ctx.fillStyle = 'rgba(251, 191, 36, 0.7)';
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'right';
      const weightLabel = forecastWeight !== 0
        ? `FORECAST (${forecastWeight > 0 ? '+' : ''}${Math.round(forecastWeight * 100)}%)`
        : 'FORECAST';
      ctx.fillText(weightLabel, lastFP[0] - 4, lastFP[1] - 5);
    }

    const points: [number, number][] = displayData.map((val, i) => [toX(i), toY(val)]);

    const lastVal = displayData[displayData.length - 1] || 0;
    const forecastAtEnd = forecastLine.length > 0 ? forecastLine[forecastLine.length - 1] : 0;
    const isAboveForecast = forecastEnabled && lastVal >= forecastAtEnd;
    const lineColor = forecastEnabled
      ? (isAboveForecast ? '#22c55e' : '#ef4444')
      : tierConfig.color;

    if (forecastLine.length > dataStart + 1) {
      const fPoints: [number, number][] = [];
      for (let i = dataStart; i < forecastLine.length; i++) {
        fPoints.push([toX(i), toY(forecastLine[i])]);
      }

      const dataPoints = points.slice(dataStart);
      if (dataPoints.length > 0 && fPoints.length > 0) {
        ctx.save();
        ctx.beginPath();
        for (let i = 0; i < fPoints.length; i++) {
          if (i === 0) ctx.moveTo(fPoints[i][0], fPoints[i][1]);
          else ctx.lineTo(fPoints[i][0], fPoints[i][1]);
        }
        ctx.lineTo(fPoints[fPoints.length - 1][0], padding.top);
        ctx.lineTo(fPoints[0][0], padding.top);
        ctx.closePath();
        ctx.clip();

        const aboveGradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
        aboveGradient.addColorStop(0, 'rgba(34, 197, 94, 0.2)');
        aboveGradient.addColorStop(1, 'rgba(34, 197, 94, 0.01)');

        ctx.beginPath();
        ctx.moveTo(dataPoints[0][0], fPoints[0][1]);
        ctx.lineTo(dataPoints[0][0], dataPoints[0][1]);
        for (let i = 1; i < dataPoints.length; i++) {
          const prev = dataPoints[i - 1];
          const curr = dataPoints[i];
          const cpx = (prev[0] + curr[0]) / 2;
          ctx.bezierCurveTo(cpx, prev[1], cpx, curr[1], curr[0], curr[1]);
        }
        ctx.lineTo(dataPoints[dataPoints.length - 1][0], fPoints[fPoints.length - 1][1]);
        ctx.closePath();
        ctx.fillStyle = aboveGradient;
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        for (let i = 0; i < fPoints.length; i++) {
          if (i === 0) ctx.moveTo(fPoints[i][0], fPoints[i][1]);
          else ctx.lineTo(fPoints[i][0], fPoints[i][1]);
        }
        ctx.lineTo(fPoints[fPoints.length - 1][0], padding.top + chartH);
        ctx.lineTo(fPoints[0][0], padding.top + chartH);
        ctx.closePath();
        ctx.clip();

        const belowGradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
        belowGradient.addColorStop(0, 'rgba(239, 68, 68, 0.01)');
        belowGradient.addColorStop(1, 'rgba(239, 68, 68, 0.12)');

        ctx.beginPath();
        ctx.moveTo(dataPoints[0][0], fPoints[0][1]);
        ctx.lineTo(dataPoints[0][0], dataPoints[0][1]);
        for (let i = 1; i < dataPoints.length; i++) {
          const prev = dataPoints[i - 1];
          const curr = dataPoints[i];
          const cpx = (prev[0] + curr[0]) / 2;
          ctx.bezierCurveTo(cpx, prev[1], cpx, curr[1], curr[0], curr[1]);
        }
        ctx.lineTo(dataPoints[dataPoints.length - 1][0], fPoints[fPoints.length - 1][1]);
        ctx.closePath();
        ctx.fillStyle = belowGradient;
        ctx.fill();
        ctx.restore();
      }
    } else {
      const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
      gradient.addColorStop(0, tierConfig.color + 'cc');
      gradient.addColorStop(0.5, tierConfig.color + '40');
      gradient.addColorStop(1, tierConfig.color + '05');

      ctx.beginPath();
      ctx.moveTo(points[dataStart][0], padding.top + chartH);
      ctx.lineTo(points[dataStart][0], points[dataStart][1]);
      for (let i = dataStart + 1; i < points.length; i++) {
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
    ctx.moveTo(points[dataStart][0], points[dataStart][1]);
    for (let i = dataStart + 1; i < points.length; i++) {
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
      const currentVal = displayData[displayData.length - 1] || 0;

      if (currentVal > 0 && effectsIntensity > 0 && now - lastSparkTime.current > 100) {
        lastSparkTime.current = now;
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const screenX = rect.left + lastPoint[0];
          const screenY = rect.top + lastPoint[1];
          const sparkCount = Math.ceil(Math.min(currentVal / (chartMode === 'cumulative' ? 100 : 1), 5) * effectsIntensity);
          particleEngine.emitSparks(screenX, screenY, sparkCount, lineColor);
        }
      }

      if (currentVal > 0 && effectsIntensity > 0 && now - lastIconTime.current > 300) {
        lastIconTime.current = now;
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const screenX = rect.left + lastPoint[0];
          const screenY = rect.top + lastPoint[1];
          const count = Math.ceil(Math.min(currentVal / (chartMode === 'cumulative' ? 200 : 2), 3) * effectsIntensity);
          particleEngine.emitEmbers(screenX, screenY, count, lineColor);
        }
      }
    }

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(chartMode === 'cumulative' ? 'CUMULATIVE' : 'PER SECOND', padding.left + 4, padding.top + 12);

    animFrameRef.current = requestAnimationFrame(draw);
  }, [maxBuckets, tierConfig, effectsIntensity, forecastEnabled, forecastPerSecond, forecastWeight, chartMode, speedMultiplier]);

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
