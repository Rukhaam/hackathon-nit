import { useState, useEffect } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { 
  LogOut, 
  LayoutDashboard, 
  Home as HomeIcon, 
  Compass, 
  User, 
  UserPlus, 
  Calendar, 
  Briefcase, 
  ShieldCheck, 
  Tags 
} from "lucide-react";
import { logout } from "../../redux/slices/authSlice";
import { logoutUserAPI } from "../../api/authApi";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Track scrolling to trigger the dynamic frosted glass effect on the top navbar
  useEffect(() => {
    const handleScroll = (e) => {
      const scrollTop = e.target.scrollTop || window.scrollY;
      setIsScrolled(scrollTop > 20);
    };

    window.addEventListener("scroll", handleScroll);
    
    const scrollContainer = document.getElementById("main-scroll-container");
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUserAPI();
    } catch (error) {
      console.error("Failed to log out from server", error);
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  const scrollToTop = () => {
    const scrollContainer = document.getElementById("main-scroll-container");
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin/dashboard";
    if (user.role === "provider") return "/provider/dashboard";
    return "/customer/dashboard";
  };

  // 🌟 NEW: Dynamic items specifically for the mobile bottom tab bar
  const getMobileNavItems = () => {
    const role = user?.role?.toLowerCase().trim();

    if (!isAuthenticated) {
      return [
        { name: "Home", path: "/", icon: HomeIcon },
        { name: "Explore", path: "/explore", icon: Compass },
        { name: "Log in", path: "/login", icon: User },
        { name: "Sign up", path: "/register", icon: UserPlus },
      ];
    }

    if (role === "admin") {
      return [
        { name: "Home", path: "/", icon: HomeIcon },
        { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Approvals", path: "/admin/approve-providers", icon: ShieldCheck },
        { name: "Categories", path: "/admin/categories", icon: Tags },
        { name: "Log out", action: handleLogout, icon: LogOut, isDanger: true },
      ];
    }

    if (role === "provider") {
      return [
        { name: "Home", path: "/", icon: HomeIcon },
        { name: "Dashboard", path: "/provider/dashboard", icon: LayoutDashboard },
        { name: "Jobs", path: "/provider/jobs", icon: Briefcase },
        { name: "Profile", path: "/provider/profile", icon: User },
        { name: "Log out", action: handleLogout, icon: LogOut, isDanger: true },
      ];
    }

    // Default to Customer
    return [
      { name: "Home", path: "/", icon: HomeIcon },
      { name: "Explore", path: "/explore", icon: Compass },
      { name: "Dashboard", path: "/customer/dashboard", icon: LayoutDashboard },
      { name: "Bookings", path: "/customer/bookings", icon: Calendar },
      { name: "Log out", action: handleLogout, icon: LogOut, isDanger: true },
    ];
  };

  return (
    <>
      {/* 🌟 1. TOP NAVBAR (Floating Island) */}
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav 
          className={`pointer-events-auto w-full max-w-5xl rounded-2xl transition-all duration-500 ease-out relative ${
            isScrolled 
              ? "bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-1" 
              : "bg-white/40 backdrop-blur-md border border-white/30 shadow-sm py-2"
          }`}
        >
          <div className="px-4 sm:px-6">
            {/* Height is slightly smaller on mobile to save screen real estate */}
            <div className="flex justify-between items-center h-12 md:h-16">
              
              {/* Logo (Visible on both Mobile and Desktop) */}
              <Link to="/" className="flex items-center gap-2.5 group" onClick={scrollToTop}>
                <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:-translate-y-0.5 transition-all duration-300">
                  <span className="text-white font-extrabold text-lg md:text-xl leading-none">L</span>
                </div>
                <span className="font-extrabold text-xl md:text-2xl text-gray-900 tracking-tight">
                  LocalHub
                </span>
              </Link>

              {/* Desktop Navigation Links */}
              <ul className="hidden md:flex items-center space-x-2">
                <li>
                  <Link
                    to="/"
                    onClick={scrollToTop}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 font-semibold rounded-xl hover:bg-gray-100/80 transition-all duration-300"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/explore" 
                    onClick={scrollToTop} 
                    className="px-4 py-2 text-gray-600 hover:text-blue-600 font-semibold rounded-xl hover:bg-blue-50/80 transition-all duration-300"
                  >
                    Explore
                  </Link>
                </li>
              </ul>

              {/* Desktop Auth Buttons */}
              <div className="hidden md:flex items-center space-x-3">
                {isAuthenticated ? (
                  <div className="flex items-center gap-2">
                    <Link
                      to={getDashboardLink()}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-700 hover:text-blue-700 bg-white/60 hover:bg-white border border-gray-200/80 hover:border-blue-200 rounded-xl shadow-sm transition-all duration-300"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center p-2.5 text-gray-500 hover:text-red-600 bg-white/60 hover:bg-red-50 border border-gray-200/80 hover:border-red-100 rounded-xl transition-all duration-300"
                      title="Log out"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-5 py-2.5 text-sm font-bold text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 rounded-xl transition-all duration-300"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 hover:-translate-y-0.5 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>

            </div>
          </div>
        </nav>
      </div>

      {/* 🌟 2. MOBILE BOTTOM TAB BAR (Appears only on mobile devices) */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 pointer-events-none">
        <nav className="pointer-events-auto bg-white/90 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl px-2 py-1.5 flex justify-between items-center">
          {getMobileNavItems().map((item, idx) => {
            const Icon = item.icon;
            
            // Render a button if it's an action (like Logout)
            if (item.action) {
              return (
                <button
                  key={idx}
                  onClick={item.action}
                  className={`flex flex-col items-center justify-center flex-1 py-2 px-1 transition-colors ${
                    item.isDanger ? "text-red-400 hover:text-red-600" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Icon size={22} className="mb-1" />
                  <span className="text-[10px] font-extrabold tracking-wide">{item.name}</span>
                </button>
              );
            }

            // Render NavLink for regular routing paths
            return (
              <NavLink
                key={idx}
                to={item.path}
                onClick={scrollToTop}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center flex-1 py-2 px-1 transition-all duration-300 ${
                    isActive
                      ? "text-blue-600 scale-105"
                      : "text-gray-400 hover:text-gray-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={22} className={`mb-1 ${isActive ? "stroke-[2.5px]" : "stroke-2"}`} />
                    <span className="text-[10px] font-extrabold tracking-wide">{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </>
  );
}