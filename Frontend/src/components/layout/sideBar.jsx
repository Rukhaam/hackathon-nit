import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  LayoutDashboard, 
  UserCheck, 
  Layers, 
  Briefcase, 
  User, 
  CalendarCheck 
} from "lucide-react"; 

export default function Sidebar() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  const isDashboardRoute = 
    location.pathname.includes("/admin") ||
    location.pathname.includes("/provider") ||
    location.pathname.includes("/customer");

  const showSidebar = isAuthenticated && user && isDashboardRoute;

  if (!showSidebar) return null;

  const getLinks = () => {
    const role = user?.role?.toLowerCase().trim();
    if (role === "admin") {
      return [
        { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Approve Providers", path: "/admin/approve-providers", icon: UserCheck },
        { name: "Categories", path: "/admin/categories", icon: Layers },
      ];
    }
    if (role === "provider") {
      return [
        { name: "Dashboard", path: "/provider/dashboard", icon: LayoutDashboard },
        { name: "Manage Jobs", path: "/provider/jobs", icon: Briefcase },
        { name: "My Profile", path: "/provider/profile", icon: User },
      ];
    }
    return [
      { name: "Dashboard", path: "/customer/dashboard", icon: LayoutDashboard },
      { name: "My Bookings", path: "/customer/bookings", icon: CalendarCheck },
    ];
  };

  const links = getLinks();

  return (
    <aside className="w-72 bg-white/50 border-r border-gray-200/60 hidden md:block flex-shrink-0 backdrop-blur-sm">
      <div className="p-6 h-full flex flex-col">
        
        {/* User Profile Summary */}
        <div className="mb-8 flex items-center gap-3 p-3 bg-gray-100/50 rounded-2xl border border-gray-200/50">
          <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold shadow-inner">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-extrabold text-gray-900 truncate">{user.name}</p>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">{user.role}</p>
          </div>
        </div>

        <div className="text-xs uppercase text-gray-400 font-extrabold tracking-widest mb-3 px-3">
          Main Menu
        </div>
        
        <nav className="space-y-1.5 flex-1">
          {links.map((link) => {
            const Icon = link.icon; 
            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-white text-gray-900 shadow-sm border border-gray-200/60"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 border border-transparent"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon 
                      size={18} 
                      className={`transition-colors ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-700"}`} 
                    />
                    {link.name}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}