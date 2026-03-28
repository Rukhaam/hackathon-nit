import {
  Droplet,
  Sparkles,
  Zap,
  Paintbrush,
  Hammer,
  Truck,
  Fan,
  Briefcase
} from "lucide-react";

// 🌟 Dynamic Icon Mapper for Categories
export const getCategoryIcon = (categoryName) => {
  if (!categoryName) {
    return <Briefcase className="w-8 h-8 md:w-10 md:h-10 text-gray-400 group-hover:text-blue-500 group-hover:scale-110 transition-all" />;
  }

  const name = categoryName.toLowerCase();

  // Customize these based on your actual database categories!
  if (name.includes("plumb")) return <Droplet className="w-8 h-8 md:w-10 md:h-10 text-blue-500 group-hover:scale-110 transition-transform" />;
  if (name.includes("clean") || name.includes("maid")) return <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-teal-500 group-hover:scale-110 transition-transform" />;
  if (name.includes("electric")) return <Zap className="w-8 h-8 md:w-10 md:h-10 text-yellow-500 group-hover:scale-110 transition-transform" />;
  if (name.includes("paint")) return <Paintbrush className="w-8 h-8 md:w-10 md:h-10 text-pink-500 group-hover:scale-110 transition-transform" />;
  if (name.includes("carpent")) return <Hammer className="w-8 h-8 md:w-10 md:h-10 text-amber-600 group-hover:scale-110 transition-transform" />;
  if (name.includes("pack") || name.includes("mov")) return <Truck className="w-8 h-8 md:w-10 md:h-10 text-indigo-500 group-hover:scale-110 transition-transform" />;
  if (name.includes("ac ") || name.includes("appliance")) return <Fan className="w-8 h-8 md:w-10 md:h-10 text-cyan-500 group-hover:scale-110 transition-transform" />;

  // Default fallback icon
  return <Briefcase className="w-8 h-8 md:w-10 md:h-10 text-gray-400 group-hover:text-blue-500 group-hover:scale-110 transition-all" />;
};