import { memo, useEffect, useRef, useState } from 'react';
import { CATEGORIES } from '../../constants';
import type { Order } from '../../types';

interface FeedItem {
  id: string;
  order: Order;
  timestamp: number;
}

const MAX_FEED = 50;

interface Props {
  orders: Order[];
  totalOrders: number;
}

function OrderFeedInner({ orders, totalOrders }: Props) {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (orders.length === 0) return;
    const newItems: FeedItem[] = orders.map(o => ({
      id: o.id,
      order: o,
      timestamp: Date.now(),
    }));

    setFeed(prev => [...newItems, ...prev].slice(0, MAX_FEED));
  }, [orders]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [feed]);

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Live Feed
        </h3>
        <span className="text-xs text-gray-600 tabular-nums">
          {totalOrders.toLocaleString()} total
        </span>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto space-y-1 min-h-0"
      >
        {feed.map(item => {
          const cat = CATEGORIES[item.order.category];
          const isHighValue = item.order.amount > 200;

          return (
            <div
              key={item.id}
              className="flex items-center gap-2 py-1 px-2 rounded-lg transition-all duration-300"
              style={{
                background: isHighValue ? cat.color + '15' : 'rgba(255,255,255,0.02)',
                borderLeft: `2px solid ${cat.color}${isHighValue ? 'aa' : '40'}`,
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white truncate">
                  {item.order.productName}
                </div>
                <div className="text-[10px] text-gray-500 truncate">
                  {item.order.customerName}
                </div>
              </div>
              <div
                className="text-xs font-bold tabular-nums flex-shrink-0"
                style={{ color: isHighValue ? cat.color : '#9ca3af' }}
              >
                ${Math.round(item.order.amount)}
              </div>
            </div>
          );
        })}

        {feed.length === 0 && (
          <div className="text-center text-gray-600 text-xs py-8">
            Press play to start the simulation
          </div>
        )}
      </div>
    </div>
  );
}

export const OrderFeed = memo(OrderFeedInner);
