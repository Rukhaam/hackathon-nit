import { useState, useEffect } from 'react';
import { ShieldCheck, Users, Sparkles } from 'lucide-react';

// --- REUSABLE STAR BORDER COMPONENT ---
// Upgraded to accept custom border radius for massive sections
const StarBorder = ({
  as: Component = "div",
  className = "",
  innerClassName = "",
  color = "#0055FF", // Sharp, vivid blue
  speed = "8s", // Slightly slower for the large perimeter
  thickness = 2,
  borderRadius = "3rem", // Default to large radius
  children,
  ...rest
}) => {
  return (
    <Component
      className={`relative overflow-hidden group transition-all duration-500 bg-gray-200/50 ${className}`}
      style={{
        padding: `${thickness}px`,
        borderRadius: borderRadius,
        ...rest.style,
      }}
      {...rest}
    >
      {/* Bottom glowing star */}
      <div
        className="absolute z-0 w-[250%] h-[300px] opacity-90 bottom-[-150px] right-[-150%] rounded-full animate-star-movement-bottom pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 20%)`,
          animationDuration: speed,
        }}
      ></div>
      {/* Top glowing star */}
      <div
        className="absolute z-0 w-[250%] h-[300px] opacity-90 top-[-150px] left-[-150%] rounded-full animate-star-movement-top pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 20%)`,
          animationDuration: speed,
        }}
      ></div>
      
      {/* Inner Container */}
      <div
        className={`relative z-10 w-full h-full ${innerClassName}`}
        style={{ borderRadius: `calc(${borderRadius} - ${thickness}px)` }}
      >
        {children}
      </div>
    </Component>
  );
};

export default function TrustedSection() {
  const [count, setCount] = useState(0);

  // Animated Counter Logic
  useEffect(() => {
    let start = 0;
    const end = 10000;
    const duration = 2500; // 2.5 seconds for a smoother, premium feel
    const increment = end / (duration / 16); 

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full bg-[#fafafa] py-24 md:py-32 overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      
      {/* --- INLINE STYLES FOR THE METALLIC SHINE --- */}
      <style>
        {`
          @keyframes text-shine {
            0% { background-position: 0% center; }
            100% { background-position: -200% center; }
          }
          .animate-text-shine {
            background-size: 200% auto;
            animation: text-shine 4s linear infinite;
          }
        `}
      </style>

      {/* 🌟 Background Glowing Orbs (Adapted for Light Mode) */}
      <div className="absolute top-0 left-1/4 w-[30rem] h-[30rem] bg-blue-300/40 rounded-full mix-blend-multiply filter blur-[128px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-indigo-300/40 rounded-full mix-blend-multiply filter blur-[128px] pointer-events-none"></div>

      {/* Expanded Width to prevent text clashing */}
      <div className="relative z-10 w-full max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        
        {/* 🌟 MASSIVE STAR BORDER CONTAINER 🌟 */}
        <StarBorder
          color="#0055FF" // Sharp Blue
          thickness={2}
          speed="7s"
          borderRadius="3rem"
          className="shadow-[0_20px_60px_-15px_rgba(0,85,255,0.1)] hover:shadow-[0_20px_60px_-15px_rgba(0,85,255,0.2)]"
          innerClassName="bg-white/80 backdrop-blur-2xl p-10 md:p-16 lg:p-20 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24 hover:bg-white/90 transition-colors duration-500"
        >
          
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none"></div>

          {/* Left Side: Text & Description */}
          <div className="flex-1 space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-blue-50 border border-blue-100 shadow-sm">
              <ShieldCheck size={20} className="text-blue-600" />
              <span className="text-xs font-extrabold text-blue-800 uppercase tracking-widest">
                Verified Excellence
              </span>
            </div>

            {/* The Charcoal-to-Silver Shining Text */}
            <h2 
              className="text-2xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 via-gray-400 to-gray-900 bg-clip-text text-transparent animate-text-shine leading-[1.15]"
            >
              Building a safer, smarter local network.
            </h2>

            <p className="text-sm md:text-xl xl:text-2xl text-gray-600 font-medium leading-relaxed max-w-3xl">
              LocalHub connects you with top-tier professionals. Every provider undergoes a strict verification process to ensure your safety, security, and absolute satisfaction.
            </p>

            <div className="flex items-center justify-center pt-4 text-xs gap-2 md:text-sm font-bold text-gray-500 uppercase tracking-widest w-fit">
              <Sparkles size={18} className="text-indigo-500" />
              Quality Guaranteed
            </div>
          </div>

          {/* Right Side: Massive Unified Counter */}
          <div className="w-full lg:w-auto min-w-[320px] relative z-10 flex flex-col justify-center items-center lg:items-end text-center lg:text-right">
            
            <h3 className="text-sm md:text-xl font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center justify-center lg:justify-end gap-3 w-full">
              <Users size={24} className="text-blue-500" /> Trusted By
            </h3>
            
            {/* Tabular-nums prevents layout shifting */}
            <h4 className="text-5xl md:text-8xl lg:text-[8rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-500 drop-shadow-sm tracking-tighter mb-6 tabular-nums flex items-baseline justify-center lg:justify-end w-full">
              {count.toLocaleString()}
              <span className="text-blue-600 ml-2 text-6xl md:text-7xl lg:text-8xl">+</span>
            </h4>
            
            <p className="text-sm md:text-xl text-gray-600 font-medium bg-white/80 px-6 py-3 rounded-2xl border border-gray-200 inline-block whitespace-nowrap shadow-sm">
              Happy users & growing daily.
            </p>
            
          </div>
          
        </StarBorder>
      </div>
    </section>
  );
}