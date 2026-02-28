import { memo, useEffect, useState } from 'react';

interface Props {
  trigger: number;
  lostCount: number;
}

function ComboLostFlashInner({ trigger, lostCount }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trigger === 0) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 1200);
    return () => clearTimeout(timer);
  }, [trigger]);

  if (!visible || trigger === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none flex items-center justify-center"
      style={{ zIndex: 45 }}
    >
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle, rgba(239,68,68,0.15), transparent 70%)',
          opacity: visible ? 1 : 0,
        }}
      />
      <div
        className="text-center transition-all duration-500"
        style={{
          transform: visible ? 'scale(1)' : 'scale(0.5)',
          opacity: visible ? 1 : 0,
        }}
      >
        <div className="text-sm font-semibold text-red-400/60 uppercase tracking-[0.3em] mb-1">
          COMBO LOST
        </div>
        <div
          className="text-3xl font-black text-red-400"
          style={{ textShadow: '0 0 30px rgba(239,68,68,0.4)' }}
        >
          x{lostCount}
        </div>
      </div>
    </div>
  );
}

export const ComboLostFlash = memo(ComboLostFlashInner);
