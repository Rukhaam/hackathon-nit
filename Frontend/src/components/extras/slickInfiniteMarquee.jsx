import React from 'react';
import { CheckCircle2, Star, Shield, Zap } from 'lucide-react';

export default function PremiumMarquee() {
  const marqueeItems = [
    { text: "100% Verified Professionals", icon: <Shield size={16} /> },
    { text: "Transparent Pricing", icon: <CheckCircle2 size={16} /> },
    { text: "Premium Quality Guaranteed", icon: <Star size={16} /> },
    { text: "Lightning Fast Booking", icon: <Zap size={16} /> },
  ];

  // Duplicate items to ensure smooth infinite scrolling
  const scrollItems = [...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems];

  return (
    <div className="relative py-6 bg-white/40 backdrop-blur-xl border-y border-white/60 overflow-hidden flex items-center shadow-sm">
      
      {/* Fade Masks for smooth entry/exit */}
      <div className="absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none"></div>

      {/* Scrolling Container */}
      {/* NOTE: You need to add 'animate-scroll' to your tailwind.config.js (see below) */}
      <div className="flex w-max animate-scroll hover:[animation-play-state:paused]">
        {scrollItems.map((item, index) => (
          <div 
            key={index} 
            className="flex items-center mx-8 md:mx-12 group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 text-gray-500 group-hover:text-blue-600 transition-colors duration-300">
              <span className="bg-gray-100 group-hover:bg-blue-50 p-2 rounded-full transition-colors duration-300">
                {item.icon}
              </span>
              <span className="font-extrabold text-sm md:text-base uppercase tracking-widest whitespace-nowrap">
                {item.text}
              </span>
            </div>
            
            {/* Dot Separator */}
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 ml-8 md:ml-12 group-hover:bg-blue-400 transition-colors"></div>
          </div>
        ))}
      </div>
    </div>
  );
}