import { memo, useCallback, useEffect, useRef } from 'react';
import { CATEGORIES } from '../../constants';
import type { Order, OrderCategory } from '../../types';

interface CardItem {
  x: number;
  y: number;
  vx: number;
  life: number;
  maxLife: number;
  width: number;
  height: number;
  color: string;
  category: OrderCategory;
  productName: string;
  amount: number;
  isHighValue: boolean;
  isTopOrder: boolean;
}

interface TopOrderEntry {
  order: Order;
  timestamp: number;
}

const MAX_CARDS = 120;
const CARD_RADIUS = 6;
const TOP_ORDER_WINDOW_MS = 3600_000;

function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawIcon(ctx: CanvasRenderingContext2D, cat: OrderCategory, cx: number, cy: number, s: number) {
  ctx.lineWidth = Math.max(1, s * 0.14);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (cat) {
    case 'shoes': {
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.35, cy + s * 0.1);
      ctx.lineTo(cx - s * 0.35, cy - s * 0.05);
      ctx.quadraticCurveTo(cx - s * 0.2, cy - s * 0.3, cx + s * 0.05, cy - s * 0.2);
      ctx.quadraticCurveTo(cx + s * 0.3, cy - s * 0.1, cx + s * 0.4, cy + s * 0.05);
      ctx.lineTo(cx + s * 0.4, cy + s * 0.1);
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case 'shirts': {
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.12, cy - s * 0.3);
      ctx.lineTo(cx - s * 0.3, cy - s * 0.15);
      ctx.lineTo(cx - s * 0.2, cy - s * 0.02);
      ctx.lineTo(cx - s * 0.15, cy - s * 0.08);
      ctx.lineTo(cx - s * 0.15, cy + s * 0.3);
      ctx.lineTo(cx + s * 0.15, cy + s * 0.3);
      ctx.lineTo(cx + s * 0.15, cy - s * 0.08);
      ctx.lineTo(cx + s * 0.2, cy - s * 0.02);
      ctx.lineTo(cx + s * 0.3, cy - s * 0.15);
      ctx.lineTo(cx + s * 0.12, cy - s * 0.3);
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case 'pants': {
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.2, cy - s * 0.3);
      ctx.lineTo(cx + s * 0.2, cy - s * 0.3);
      ctx.lineTo(cx + s * 0.2, cy + s * 0.3);
      ctx.lineTo(cx + s * 0.04, cy + s * 0.3);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx - s * 0.04, cy + s * 0.3);
      ctx.lineTo(cx - s * 0.2, cy + s * 0.3);
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case 'dresses': {
      ctx.beginPath();
      ctx.moveTo(cx, cy - s * 0.3);
      ctx.lineTo(cx - s * 0.1, cy - s * 0.08);
      ctx.lineTo(cx - s * 0.3, cy + s * 0.3);
      ctx.lineTo(cx + s * 0.3, cy + s * 0.3);
      ctx.lineTo(cx + s * 0.1, cy - s * 0.08);
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case 'jackets': {
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.12, cy - s * 0.3);
      ctx.lineTo(cx - s * 0.35, cy - s * 0.12);
      ctx.lineTo(cx - s * 0.35, cy + s * 0.08);
      ctx.lineTo(cx - s * 0.17, cy);
      ctx.lineTo(cx - s * 0.17, cy + s * 0.3);
      ctx.lineTo(cx + s * 0.17, cy + s * 0.3);
      ctx.lineTo(cx + s * 0.17, cy);
      ctx.lineTo(cx + s * 0.35, cy + s * 0.08);
      ctx.lineTo(cx + s * 0.35, cy - s * 0.12);
      ctx.lineTo(cx + s * 0.12, cy - s * 0.3);
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case 'accessories': {
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.25, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - s * 0.25);
      ctx.lineTo(cx, cy - s * 0.08);
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + s * 0.12, cy + s * 0.08);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - s * 0.35);
      ctx.lineTo(cx, cy - s * 0.25);
      ctx.stroke();
      break;
    }
    case 'sportswear': {
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.25, cy);
      ctx.lineTo(cx - s * 0.08, cy);
      ctx.lineTo(cx - s * 0.08, cy - s * 0.2);
      ctx.lineTo(cx + s * 0.08, cy - s * 0.2);
      ctx.lineTo(cx + s * 0.08, cy);
      ctx.lineTo(cx + s * 0.25, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx - s * 0.25, cy, s * 0.06, 0, Math.PI * 2);
      ctx.arc(cx + s * 0.25, cy, s * 0.06, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'bags': {
      drawRoundRect(ctx, cx - s * 0.2, cy - s * 0.05, s * 0.4, s * 0.35, s * 0.04);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.1, cy - s * 0.05);
      ctx.quadraticCurveTo(cx - s * 0.1, cy - s * 0.3, cx, cy - s * 0.3);
      ctx.quadraticCurveTo(cx + s * 0.1, cy - s * 0.3, cx + s * 0.1, cy - s * 0.05);
      ctx.stroke();
      break;
    }
  }
}

function computeAlpha(x: number, canvasWidth: number, cardWidth: number): number {
  const entryZone = canvasWidth * 0.25;
  const exitZone = canvasWidth * 0.2;
  const rightEdge = canvasWidth - cardWidth / 2;
  const leftEdge = cardWidth / 2;

  const distFromRight = rightEdge - x;
  const distFromLeft = x - leftEdge;

  let alpha = 1;
  if (distFromRight < entryZone) {
    alpha = Math.min(alpha, distFromRight / entryZone);
  }
  if (distFromLeft < exitZone) {
    alpha = Math.min(alpha, distFromLeft / exitZone);
  }

  return Math.max(0, Math.min(1, alpha));
}

function cardSizeFromAmount(amount: number): number {
  const minAmount = 10;
  const maxAmount = 500;
  const minSize = 28;
  const maxSize = 68;
  const t = Math.min(1, Math.max(0, (amount - minAmount) / (maxAmount - minAmount)));
  return minSize + t * (maxSize - minSize);
}

interface Props {
  orders: Order[];
  intensity: number;
}

function BubbleOverlayInner({ orders, intensity }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardsRef = useRef<CardItem[]>([]);
  const pendingRef = useRef<Order[]>([]);
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const topOrdersRef = useRef<Map<OrderCategory, TopOrderEntry>>(new Map());
  const topOrderCooldownRef = useRef<Map<OrderCategory, number>>(new Map());

  useEffect(() => {
    const newOrders = orders.slice(-20);

    const now = Date.now();
    for (const order of newOrders) {
      const existing = topOrdersRef.current.get(order.category);
      if (!existing || order.amount > existing.order.amount || now - existing.timestamp > TOP_ORDER_WINDOW_MS) {
        if (!existing || order.amount > existing.order.amount) {
          topOrdersRef.current.set(order.category, { order, timestamp: now });
        }
      }
    }

    for (const [cat, entry] of topOrdersRef.current.entries()) {
      if (now - entry.timestamp > TOP_ORDER_WINDOW_MS) {
        topOrdersRef.current.delete(cat);
      }
    }

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

    const realNow = Date.now();
    while (pendingRef.current.length > 0 && cardsRef.current.length < MAX_CARDS) {
      const order = pendingRef.current.shift()!;
      const cat = CATEGORIES[order.category];
      const isHighValue = order.amount > 200;
      const cardW = cardSizeFromAmount(order.amount);
      const cardH = cardW * 0.75;

      const topEntry = topOrdersRef.current.get(order.category);
      const isTopOrder = topEntry !== undefined && topEntry.order.id === order.id;
      const cooldown = topOrderCooldownRef.current.get(order.category) || 0;
      const shouldShowTop = isTopOrder && (realNow - cooldown > 10000);

      if (shouldShowTop) {
        topOrderCooldownRef.current.set(order.category, realNow);
      }

      cardsRef.current.push({
        x: w + 20,
        y: 30 + Math.random() * (h - 70),
        vx: -(60 + Math.random() * 80) * (intensity > 0 ? intensity : 0.5),
        life: 5 + Math.random() * 3,
        maxLife: 8,
        width: cardW,
        height: cardH,
        color: cat.color,
        category: order.category,
        productName: order.productName,
        amount: order.amount,
        isHighValue,
        isTopOrder: shouldShowTop,
      });
    }

    let i = cardsRef.current.length;
    while (i--) {
      const c = cardsRef.current[i];
      c.life -= dt;
      if (c.life <= 0 || c.x < -c.width - 20) {
        cardsRef.current.splice(i, 1);
        continue;
      }
      c.x += c.vx * dt;
    }

    ctx.clearRect(0, 0, w, h);

    for (const c of cardsRef.current) {
      const alpha = computeAlpha(c.x, w, c.width);
      if (alpha <= 0) continue;

      ctx.globalAlpha = alpha * 0.9;

      if (c.isHighValue || c.isTopOrder) {
        ctx.shadowColor = c.color;
        ctx.shadowBlur = c.isTopOrder ? 18 : 12;
      }

      drawRoundRect(ctx, c.x - c.width / 2, c.y - c.height / 2, c.width, c.height, CARD_RADIUS);
      ctx.fillStyle = c.color + (c.isTopOrder ? '30' : '18');
      ctx.fill();
      ctx.strokeStyle = c.color + (c.isTopOrder ? 'bb' : '70');
      ctx.lineWidth = c.isTopOrder ? 2 : 1.5;
      ctx.stroke();

      ctx.shadowBlur = 0;

      ctx.strokeStyle = c.color;
      const iconSize = Math.min(c.width, c.height) * 0.45;
      drawIcon(ctx, c.category, c.x, c.y, iconSize);

      const showPrice = c.isHighValue || c.isTopOrder || c.width > 38;
      if (showPrice) {
        const fontSize = Math.max(7, c.width * 0.16);
        ctx.font = `bold ${fontSize}px system-ui`;
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.globalAlpha = alpha * 0.7;
        ctx.fillText(`$${Math.round(c.amount)}`, c.x, c.y + c.height / 2 + 2);
      }

      if (c.isTopOrder) {
        ctx.globalAlpha = alpha * 0.6;
        ctx.font = `bold ${Math.max(6, c.width * 0.13)}px system-ui`;
        ctx.fillStyle = c.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('TOP', c.x, c.y - c.height / 2 - 2);
      }
    }

    ctx.globalAlpha = 1;
    rafRef.current = requestAnimationFrame(loop);
  }, [intensity]);

  useEffect(() => {
    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
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
