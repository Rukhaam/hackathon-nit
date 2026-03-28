export const footerContent = {
  guest: {
    col1: {
      title: "Customers",
      links: [
        { name: "Explore Services", path: "/" },
        { name: "Create Account", path: "/register" },
        { name: "Help Center", path: "#" },
      ],
    },
    col2: {
      title: "Providers",
      links: [
        { name: "Join as Pro", path: "/register" },
        { name: "Provider Login", path: "/login" },
        { name: "Success Stories", path: "#" },
      ],
    },
    cta: { title: "Ready to start?", btnText: "Join Now", path: "/register" },
  },
  customer: {
    col1: {
      title: "My Account",
      links: [
        { name: "My Dashboard", path: "/customer/dashboard" },
        { name: "My Bookings", path: "/customer/bookings" },
        { name: "Account Settings", path: "#" },
      ],
    },
    col2: {
      title: "Discover",
      links: [
        { name: "Browse Services", path: "/" },
        { name: "Leave a Review", path: "/customer/bookings" },
        { name: "Customer Support", path: "#" },
      ],
    },
    cta: { title: "Need something done?", btnText: "Book Service", path: "/" },
  },
  provider: {
    col1: {
      title: "My Business",
      links: [
        { name: "Provider Dashboard", path: "/provider/dashboard" },
        { name: "Manage Jobs", path: "/provider/jobs" },
        { name: "Earnings & Stats", path: "/provider/dashboard" },
      ],
    },
    col2: {
      title: "Settings",
      links: [
        { name: "Edit Profile", path: "/provider/profile" },
        { name: "Duty Status", path: "/provider/profile" },
        { name: "Provider Support", path: "#" },
      ],
    },
    cta: {
      title: "Check new requests?",
      btnText: "View Jobs",
      path: "/provider/jobs",
    },
  },
  admin: {
    col1: {
      title: "Platform",
      links: [
        { name: "Command Center", path: "/admin/dashboard" },
        { name: "Manage Users", path: "/admin/dashboard" },
        { name: "Manage Categories", path: "/admin/categories" },
      ],
    },
    col2: {
      title: "Audits",
      links: [
        { name: "Provider Approvals", path: "/admin/approve-providers" },
        { name: "Job Audits (Photos)", path: "/admin/dashboard" },
        { name: "System Logs", path: "#" },
      ],
    },
    cta: {
      title: "Review pending?",
      btnText: "Approvals",
      path: "/admin/approve-providers",
    },
  },
};
