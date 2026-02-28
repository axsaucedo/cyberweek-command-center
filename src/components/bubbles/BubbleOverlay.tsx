import { memo, useCallback, useEffect, useRef } from 'react';
import { CATEGORIES } from '../../constants';
import type { Order, OrderCategory } from '../../types';

interface BubbleItem {
  x: number;
  y: number;
  vy: number;
  vx: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  category: OrderCategory;
  productName: string;
  amount: number;
  alpha: number;
  wobbleOffset: number;
  wobbleSpeed: number;
  isHighValue: boolean;
}

const MAX_BUBBLES = 150;

function drawIcon(ctx: CanvasRenderingContext2D, cat: OrderCategory, x: number, y: number, s: number) {
  ctx.lineWidth = Math.max(1, s * 0.12);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (cat) {
    case 'shoes': {
      ctx.beginPath();
      ctx.moveTo(x - s * 0.4, y + s * 0.15);
      ctx.lineTo(x - s * 0.4, y - s * 0.1);
      ctx.quadraticCurveTo(x - s * 0.3, y - s * 0.35, x, y - s * 0.25);
      ctx.quadraticCurveTo(x + s * 0.3, y - s * 0.15, x + s * 0.45, y + s * 0.05);
      ctx.lineTo(x + s * 0.45, y + s * 0.15);
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case 'shirts': {
      ctx.beginPath();
      ctx.moveTo(x - s * 0.15, y - s * 0.35);
      ctx.lineTo(x - s * 0.35, y - s * 0.2);
      ctx.lineTo(x - s * 0.25, y - s * 0.05);
      ctx.lineTo(x - s * 0.18, y - s * 0.12);
      ctx.lineTo(x - s * 0.18, y + s * 0.35);
      ctx.lineTo(x + s * 0.18, y + s * 0.35);
      ctx.lineTo(x + s * 0.18, y - s * 0.12);
      ctx.lineTo(x + s * 0.25, y - s * 0.05);
      ctx.lineTo(x + s * 0.35, y - s * 0.2);
      ctx.lineTo(x + s * 0.15, y - s * 0.35);
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case 'pants': {
      ctx.beginPath();
      ctx.moveTo(x - s * 0.25, y - s * 0.35);
      ctx.lineTo(x + s * 0.25, y - s * 0.35);
      ctx.lineTo(x + s * 0.25, y + s * 0.35);
      ctx.lineTo(x + s * 0.05, y + s * 0.35);
      ctx.lineTo(x, y);
      ctx.lineTo(x - s * 0.05, y + s * 0.35);
      ctx.lineTo(x - s * 0.25, y + s * 0.35);
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case 'dresses': {
      ctx.beginPath();
      ctx.moveTo(x, y - s * 0.35);
      ctx.lineTo(x - s * 0.12, y - s * 0.1);
      ctx.lineTo(x - s * 0.35, y + s * 0.35);
      ctx.lineTo(x + s * 0.35, y + s * 0.35);
      ctx.lineTo(x + s * 0.12, y - s * 0.1);
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case 'jackets': {
      ctx.beginPath();
      ctx.moveTo(x - s * 0.15, y - s * 0.35);
      ctx.lineTo(x - s * 0.4, y - s * 0.15);
      ctx.lineTo(x - s * 0.4, y + s * 0.1);
      ctx.lineTo(x - s * 0.2, y);
      ctx.lineTo(x - s * 0.2, y + s * 0.35);
      ctx.lineTo(x + s * 0.2, y + s * 0.35);
      ctx.lineTo(x + s * 0.2, y);
      ctx.lineTo(x + s * 0.4, y + s * 0.1);
      ctx.lineTo(x + s * 0.4, y - s * 0.15);
      ctx.lineTo(x + s * 0.15, y - s * 0.35);
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case 'accessories': {
      ctx.beginPath();
      ctx.arc(x, y, s * 0.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y - s * 0.3);
      ctx.lineTo(x, y - s * 0.1);
      ctx.moveTo(x, y);
      ctx.lineTo(x + s * 0.15, y + s * 0.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y - s * 0.4);
      ctx.lineTo(x, y - s * 0.3);
      ctx.stroke();
      break;
    }
    case 'sportswear': {
      ctx.beginPath();
      ctx.moveTo(x - s * 0.3, y);
      ctx.lineTo(x - s * 0.1, y);
      ctx.lineTo(x - s * 0.1, y - s * 0.25);
      ctx.lineTo(x + s * 0.1, y - s * 0.25);
      ctx.lineTo(x + s * 0.1, y);
      ctx.lineTo(x + s * 0.3, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x - s * 0.3, y, s * 0.08, 0, Math.PI * 2);
      ctx.arc(x + s * 0.3, y, s * 0.08, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'bags': {
      ctx.beginPath();
      ctx.roundRect(x - s * 0.25, y - s * 0.1, s * 0.5, s * 0.4, s * 0.05);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - s * 0.12, y - s * 0.1);
      ctx.quadraticCurveTo(x - s * 0.12, y - s * 0.35, x, y - s * 0.35);
      ctx.quadraticCurveTo(x + s * 0.12, y - s * 0.35, x + s * 0.12, y - s * 0.1);
      ctx.stroke();
      break;
    }
  }
}

interface Props {
  orders: Order[];
  intensity: number;
}

function BubbleOverlayInner({ orders, intensity }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<BubbleItem[]>([]);
  const pendingRef = useRef<Order[]>([]);
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const runningRef = useRef(false);

  useEffect(() => {
    const newOrders = orders.slice(-20);
    pendingRef.current.push(...newOrders);
    if (pendingRef.current.length > 50) {
      pendingRef.current = pendingRef.current.slice(-50);
    }
  }, [orders]);

  const loop = useCallback(() => {
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

    const now = performance.now();
    const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
    lastTimeRef.current = now;

    while (pendingRef.current.length > 0 && bubblesRef.current.length < MAX_BUBBLES) {
      const order = pendingRef.current.shift()!;
      const cat = CATEGORIES[order.category];
      const isHighValue = order.amount > 200;
      const size = isHighValue ? 28 + Math.random() * 12 : 16 + Math.random() * 10;

      bubblesRef.current.push({
        x: 40 + Math.random() * (w - 80),
        y: h + 20,
        vy: -(40 + Math.random() * 60) * (intensity > 0 ? intensity : 0.5),
        vx: 0,
        life: 3 + Math.random() * 2,
        maxLife: 5,
        size,
        color: cat.color,
        category: order.category,
        productName: order.productName,
        amount: order.amount,
        alpha: 1,
        wobbleOffset: Math.random() * Math.PI * 2,
        wobbleSpeed: 1.5 + Math.random() * 2,
        isHighValue,
      });
    }

    let i = bubblesRef.current.length;
    while (i--) {
      const b = bubblesRef.current[i];
      b.life -= dt;
      if (b.life <= 0 || b.y < -50) {
        bubblesRef.current.splice(i, 1);
        continue;
      }
      b.y += b.vy * dt;
      b.vx = Math.sin(now / 1000 * b.wobbleSpeed + b.wobbleOffset) * 15;
      b.x += b.vx * dt;
      b.alpha = Math.min(1, b.life / (b.maxLife * 0.3));
    }

    ctx.clearRect(0, 0, w, h);

    for (const b of bubblesRef.current) {
      ctx.globalAlpha = b.alpha * 0.85;

      if (b.isHighValue) {
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 15;
      }

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
      ctx.fillStyle = b.color + '25';
      ctx.fill();
      ctx.strokeStyle = b.color + '60';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.shadowBlur = 0;

      ctx.strokeStyle = b.color;
      drawIcon(ctx, b.category, b.x, b.y, b.size);

      if (b.isHighValue && b.size > 20) {
        ctx.font = `${Math.max(8, b.size * 0.3)}px system-ui`;
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = b.alpha * 0.6;
        ctx.fillText(`$${Math.round(b.amount)}`, b.x, b.y + b.size + 8);
      }

      if (b.life > b.maxLife * 0.5) {
        ctx.font = `${Math.max(7, b.size * 0.25)}px system-ui`;
        ctx.fillStyle = b.color + 'aa';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = b.alpha * 0.5;
        const nameText = b.productName.length > 12 ? b.productName.slice(0, 10) + '..' : b.productName;
        ctx.fillText(nameText, b.x, b.y - b.size - 6);
      }
    }

    ctx.globalAlpha = 1;
    rafRef.current = requestAnimationFrame(loop);
  }, [intensity]);

  useEffect(() => {
    runningRef.current = true;
    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      runningRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [loop]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 2 }}
    />
  );
}

export const BubbleOverlay = memo(BubbleOverlayInner);
