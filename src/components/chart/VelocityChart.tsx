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
  chartMode: 'net' | 'cumulative';
}

function VelocityChartInner({ buckets, maxBuckets, tier, effectsIntensity, forecastEnabled, forecastOPM, chartMode }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef(0);
  const lastSparkTime = useRef(0);
  const lastIconTime = useRef(0);

  const bucketsRef = useRef(buckets);
  bucketsRef.current = buckets;

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

    const rawBuckets = bucketsRef.current;

    let displayData: number[];
    if (chartMode === 'cumulative') {
      displayData = [];
      let sum = 0;
      for (const v of rawBuckets) {
        sum += v;
        displayData.push(sum);
      }
    } else {
      displayData = rawBuckets;
    }

    let forecastLine: number[];
    if (forecastEnabled && forecastPerSecond > 0) {
      if (chartMode === 'cumulative') {
        forecastLine = displayData.map((_, i) => (i + 1) * forecastPerSecond);
      } else {
        forecastLine = displayData.map(() => forecastPerSecond);
      }
    } else {
      forecastLine = [];
    }

    const allVals = [...displayData, ...forecastLine];
    const maxVal = Math.max(5, ...allVals) * 1.15;
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
    const labelCount = Math.min(6, displayData.length);
    const step = Math.floor(displayData.length / labelCount) || 1;
    for (let i = 0; i < displayData.length; i += step) {
      const x = padding.left + (i / Math.max(1, displayData.length - 1)) * chartW;
      const secsAgo = displayData.length - 1 - i;
      const lbl = secsAgo === 0 ? 'now' : `-${secsAgo}s`;
      ctx.fillText(lbl, x, h - 8);
    }

    if (forecastLine.length > 1) {
      const fPoints: [number, number][] = forecastLine.map((val, i) => [
        padding.left + (i / Math.max(1, maxBuckets - 1)) * chartW,
        padding.top + chartH - (val / maxVal) * chartH,
      ]);

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
      ctx.fillText('FORECAST', lastFP[0] - 4, lastFP[1] - 5);
    }

    if (displayData.length < 2) {
      animFrameRef.current = requestAnimationFrame(draw);
      return;
    }

    const points: [number, number][] = displayData.map((val, i) => [
      padding.left + (i / (maxBuckets - 1)) * chartW,
      padding.top + chartH - (val / maxVal) * chartH,
    ]);

    const lastVal = displayData[displayData.length - 1] || 0;
    const forecastAtEnd = forecastLine.length > 0 ? forecastLine[forecastLine.length - 1] : 0;
    const isAboveForecast = forecastEnabled && lastVal >= forecastAtEnd;
    const lineColor = forecastEnabled
      ? (isAboveForecast ? '#22c55e' : '#ef4444')
      : tierConfig.color;

    if (forecastLine.length > 0) {
      const fPoints: [number, number][] = forecastLine.map((val, i) => [
        padding.left + (i / Math.max(1, maxBuckets - 1)) * chartW,
        padding.top + chartH - (val / maxVal) * chartH,
      ]);

      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < fPoints.length; i++) {
        if (i === 0) ctx.moveTo(fPoints[i][0], fPoints[i][1]);
        else ctx.lineTo(fPoints[i][0], fPoints[i][1]);
      }
      ctx.lineTo(w - padding.right, padding.top);
      ctx.lineTo(padding.left, padding.top);
      ctx.closePath();
      ctx.clip();

      const aboveGradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
      aboveGradient.addColorStop(0, 'rgba(34, 197, 94, 0.2)');
      aboveGradient.addColorStop(1, 'rgba(34, 197, 94, 0.01)');

      ctx.beginPath();
      ctx.moveTo(points[0][0], fPoints[0][1]);
      ctx.lineTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpx = (prev[0] + curr[0]) / 2;
        ctx.bezierCurveTo(cpx, prev[1], cpx, curr[1], curr[0], curr[1]);
      }
      ctx.lineTo(points[points.length - 1][0], fPoints[fPoints.length - 1][1]);
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
      ctx.lineTo(w - padding.right, padding.top + chartH);
      ctx.lineTo(padding.left, padding.top + chartH);
      ctx.closePath();
      ctx.clip();

      const belowGradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
      belowGradient.addColorStop(0, 'rgba(239, 68, 68, 0.01)');
      belowGradient.addColorStop(1, 'rgba(239, 68, 68, 0.12)');

      ctx.beginPath();
      ctx.moveTo(points[0][0], fPoints[0][1]);
      ctx.lineTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpx = (prev[0] + curr[0]) / 2;
        ctx.bezierCurveTo(cpx, prev[1], cpx, curr[1], curr[0], curr[1]);
      }
      ctx.lineTo(points[points.length - 1][0], fPoints[fPoints.length - 1][1]);
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
  }, [maxBuckets, tierConfig, effectsIntensity, forecastEnabled, forecastPerSecond, chartMode]);

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
