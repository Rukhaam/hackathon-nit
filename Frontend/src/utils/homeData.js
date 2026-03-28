export const featuresData = [
  {
    id: "01",
    title: "Lightning Fast Booking",
    description:
      "Connect with local professionals instantly. No more waiting days for callbacks, quotes, or endless email chains.",
  },
  {
    id: "02",
    title: "Verified Professionals",
    description:
      "Every service provider is thoroughly vetted and strictly background-checked by our team for your peace of mind.",
  },
  {
    id: "03",
    title: "Transparent Pricing",
    description:
      "Know exactly what you are going to pay before the job even starts. Zero hidden fees or surprise upcharges.",
  },

  {
    id: "04",
    title: "Real-Time Tracking",
    description:
      "Monitor your booking status live directly from your personalized dashboard. Know exactly what is happening.",
  },
  {
    id: "05",
    title: "24/7 Expert Support",
    description:
      "Our dedicated support team is always on standby to help you resolve any issues or answer questions, day or night.",
  },
];

export const getCategoryImage = (categoryName) => {
  const name = categoryName.toLowerCase();

  if (name.includes("plumb"))
    return "https://img.freepik.com/free-photo/technician-checking-heating-system-boiler-room_169016-53608.jpg?semt=ais_hybrid&w=740&q=80";
  if (name.includes("clean") || name.includes("maid"))
    return "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80";
  if (name.includes("electric"))
    return "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80";
  if (name.includes("paint"))
    return "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80";
  if (name.includes("carpent"))
    return "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=800&q=80";
  if (name.includes("pack") || name.includes("mov"))
    return "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";
  if (
    name.includes("ac ") ||
    name.includes("appliance") ||
    name.includes("repair")
  )
    return "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80";
  if (
    name.includes("tutor") ||
    name.includes("teach") ||
    name.includes("Home Tutor")
  )
    return "https://homeshiksha.com/wp-content/uploads/2024/10/image-247-1024x705.png";
  // Default high-quality fallback
  return "https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=80";
};
