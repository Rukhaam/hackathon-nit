import { Loader2 } from "lucide-react";

export default function LoadingSpinner({
  message = "Loading...",
  fullScreen = true,
}) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* 🌟 Custom Layered Spinner */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing background glow */}
        <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
        
        {/* Outer spinning gradient ring */}
        <div className="absolute inset-[-10px] rounded-full border-[3px] border-transparent border-t-blue-600 border-l-blue-400 opacity-80 animate-spin"></div>
        
        {/* Inner solid circle holding the icon */}
        <div className="relative bg-white p-3.5 rounded-full shadow-xl shadow-blue-900/5 border border-gray-100 flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-blue-600 animate-[spin_0.8s_linear_infinite]" />
        </div>
      </div>

      {/* 🌟 Polished Text & Bouncing Dots */}
      {message && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-gray-900 font-extrabold text-base tracking-tight">
            {message}
          </p>
          
          {/* Bouncing dots animation */}
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDuration: '1s' }}></span>
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms", animationDuration: '1s' }}></span>
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms", animationDuration: '1s' }}></span>
          </div>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      // Fixed overlay ensures it sits on top of everything perfectly
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-md w-full animate-in fade-in duration-300">
        {content} 
      </div>
    );
  }

  return (
    <div className="w-full py-20 flex items-center justify-center">
      {content}
    </div>
  );
}