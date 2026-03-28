import { useState } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { logout } from "../../redux/slices/authSlice";
import { logoutUserAPI } from "../../api/authApi";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

// 🌟 FIX: Target the specific main container that actually handles the scrolling
const scrollToTop = () => {
  const scrollContainer = document.getElementById("main-scroll-container");
  if (scrollContainer) {
    scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" }); // Fallback
  }
};

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin/dashboard";
    if (user.role === "provider") return "/provider/dashboard";
    return "/customer/dashboard";
  };

  const getSidebarLinks = () => {
    const role = user?.role?.toLowerCase().trim();
    if (role === "admin") {
      return [
        { name: "Dashboard", path: "/admin/dashboard" },
        { name: "Approve Providers", path: "/admin/approve-providers" },
        { name: "Categories", path: "/admin/categories" },
      ];
    }
    if (role === "provider") {
      return [
        { name: "Dashboard", path: "/provider/dashboard" },
        { name: "Manage Jobs", path: "/provider/jobs" },
        { name: "My Profile", path: "/provider/profile" },
      ];
    }
    if (role === "customer") {
      return [
        { name: "Dashboard", path: "/customer/dashboard" },
        { name: "My Bookings", path: "/customer/bookings" },
      ];
    }
    return [];
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/60 transition-all"  >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2.5 group" onClick={scrollToTop}>
            <div className="w-9 h-9 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
              <span className="text-white font-extrabold text-xl leading-none " >
                L
              </span>
            </div>
            <span className="font-extrabold text-2xl text-gray-900 tracking-tight">
              LocalHub
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <ul className="hidden md:flex items-center space-x-1">
            <li>
              <Link
                to="/"
                onClick={scrollToTop}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-semibold rounded-lg hover:bg-gray-100/50 transition-all"
              >
                Home
              </Link>
            </li>
            <li>
              <button
                onClick={() =>
                  document
                    .getElementById("providers-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-semibold rounded-lg hover:bg-gray-100/50 transition-all"
              >
                Explore
              </button>
            </li>
          </ul>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to={getDashboardLink()}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-700 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl shadow-sm transition-all"
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Log out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-md hover:shadow-lg"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none p-2 bg-gray-100 rounded-lg"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Animated Mobile Navigation Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/60 shadow-2xl absolute w-full left-0 overflow-hidden"
          >
            <ul className="px-4 pt-4 pb-6 space-y-2">
              <li>
                <Link
                  to="/"
                  onClick={() => {
                    scrollToTop();
                    setIsOpen(false);
                  }}
                  className="block px-4 py-3 text-base font-bold text-gray-800 hover:bg-gray-100 rounded-xl"
                >
                  Home
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    document
                      .getElementById("providers-section")
                      ?.scrollIntoView({ behavior: "smooth" });
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-base font-bold text-gray-800 hover:bg-gray-100 rounded-xl"
                >
                  Explore Services
                </button>
              </li>

              <li className="border-t border-gray-100 mt-4 pt-4">
                <ul className="space-y-2">
                  {isAuthenticated ? (
                    <>
                      <li className="mb-2">
                        <div className="px-4 text-xs uppercase text-blue-600 font-extrabold tracking-widest mb-3">
                          {user?.role} Menu
                        </div>
                        <ul className="space-y-1">
                          {getSidebarLinks().map((link) => (
                            <li key={link.name}>
                              <NavLink
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) =>
                                  `block px-4 py-3 text-sm font-bold rounded-xl ${
                                    isActive
                                      ? "bg-gray-900 text-white shadow-md"
                                      : "text-gray-600 hover:bg-gray-100"
                                  }`
                                }
                              >
                                {link.name}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      </li>

                      <li className="border-t border-gray-100 pt-3 mt-2">
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsOpen(false);
                          }}
                          className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <LogOut size={16} /> Log out
                        </button>
                      </li>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <Link
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="block text-center px-4 py-3 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl"
                      >
                        Log in
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsOpen(false)}
                        className="block text-center px-4 py-3 text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 rounded-xl"
                      >
                        Sign up
                      </Link>
                    </div>
                  )}
                </ul>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
