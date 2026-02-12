
import React, { useEffect, useState, useRef } from 'react';
import { SlotItem } from '../types';

interface SlotReelProps {
  items: SlotItem[];
  targetIndex: number;
  isSpinning: boolean;
  onFinish: () => void;
  delay?: number;
}

const SlotReel: React.FC<SlotReelProps> = ({ items, targetIndex, isSpinning, onFinish, delay = 0 }) => {
  const [offset, setOffset] = useState(0);
  const ITEM_HEIGHT = 60;

  useEffect(() => {
    if (isSpinning) {
      const totalSpins = 12 + Math.floor(Math.random() * 6);
      const finalPosition = (totalSpins * items.length + targetIndex) * ITEM_HEIGHT;

      const timer = setTimeout(() => {
        setOffset(-finalPosition);

        const finishTimer = setTimeout(() => {
          onFinish();
        }, 3500);

        return () => clearTimeout(finishTimer);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isSpinning, targetIndex, items.length, delay, onFinish]);

  const displayItems = Array(25).fill(items).flat();

  return (
    <div className="relative h-[60px] w-full overflow-hidden">
      <div
        className="absolute w-full transition-transform duration-[3500ms] cubic-bezier(0.2, 0, 0, 1)"
        style={{ transform: `translateY(${offset}px)` }}
      >
        {displayItems.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className="h-[60px] flex items-center justify-center px-1"
          >
            <span className="text-[13px] font-serif font-bold text-slate-700 text-center leading-tight tracking-tight">{item.name}</span>
          </div>
        ))}
      </div>
      {/* 정교한 대기 오버레이 */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white via-transparent to-white opacity-80" />
      <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/[0.02] rounded-[22px]" />
    </div>
  );
};

export default SlotReel;
