'use client';

import { Send } from 'lucide-react';

export default function AnimatedStarSearchBar({ glowFilter = 'none' }) {
  const starSize = {
    small: 12,
    medium: 18,
    large: 24,
  };

  return (
    <div className="bg-white border border-[#006fcf] border-solid flex items-center justify-between overflow-clip p-[16px] rounded-[10px] w-full h-[56px]" style={{ filter: glowFilter }}>
      {/* Three Animated Stars Icon - 24px Frame */}
      <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="flex items-center" style={{ marginLeft: '2px', transform: 'scale(0.85)', transformOrigin: 'center' }}>
          <style>{`
            @keyframes starBreathe {
              0%, 100% { opacity: 0.6; }
              50% { opacity: 1; }
            }

            .starAnimSmall { animation: starBreathe 1.8s infinite ease-in-out; }
            .starAnimMedium { animation: starBreathe 1.8s infinite ease-in-out; animation-delay: -0.6s; }
            .starAnimLarge { animation: starBreathe 1.8s infinite ease-in-out; animation-delay: -1.2s; }
          `}</style>

          {/* Large Star */}
          <svg className="starAnimLarge" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#006fcf', width: starSize.large, height: starSize.large, marginRight: '-6px' }}>
            <path d="M12 1 L14 9 L22 11 L14 13 L12 21 L10 13 L2 11 L10 9 Z" />
          </svg>

          {/* Medium Star */}
          <svg className="starAnimMedium" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#006fcf', width: starSize.medium, height: starSize.medium, marginRight: '-6px', marginTop: '-15px' }}>
            <path d="M12 1 L14 9 L22 11 L14 13 L12 21 L10 13 L2 11 L10 9 Z" />
          </svg>

          {/* Small Star */}
          <svg className="starAnimSmall" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#006fcf', width: starSize.small, height: starSize.small, marginLeft: '-19px', marginTop: '-30px' }}>
            <path d="M12 1 L14 9 L22 11 L14 13 L12 21 L10 13 L2 11 L10 9 Z" />
          </svg>
        </div>
      </div>

      <input
        type="text"
        placeholder="Ask your AI Assistant"
        className="flex-1 bg-transparent border-0 outline-none pl-[24px] text-[14px] text-[#b3b3b3] placeholder-[#b3b3b3]"
      />

      <div className="bg-[#b3b3b3] h-[26px] w-px mx-[12px]" />

      <Send size={28} className="shrink-0 cursor-pointer text-[#006fcf] hover:text-[#004999]" />
    </div>
  );
}
