import { Link } from "react-router-dom";
import { useSelector } from "react-redux"; // 🌟 Import Redux
import { Github, Twitter, Linkedin, Instagram, ArrowRight } from "lucide-react";
import { footerContent } from "../../utils/footerData";
export default function Footer() {
  const currentYear = new Date().getFullYear();

  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const role = isAuthenticated && user ? user.role.toLowerCase() : "guest";

  const content = footerContent[role] || footerContent.guest;

  return (
    <footer className="relative bg-[#0a0a0a] text-white pt-24 pb-8 border-t border-gray-800/60 overflow-hidden mt-auto shrink-0 font-sans">
      {/* The "Slick" Glowing Background Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_120%,rgba(37,99,235,0.15),rgba(255,255,255,0))] pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">
          {/* Brand Column (Stays the same for everyone) */}
          <div className="md:col-span-4 lg:col-span-5">
            <Link to="/" className="flex items-center gap-3 group mb-6 w-max">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 group-hover:scale-105 transition-all duration-300">
                <span className="text-white font-extrabold text-xl leading-none">
                  L
                </span>
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                LocalHub
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed text-sm max-w-sm mb-8">
              The most elegant way to find, book, and manage premium local
              services. We bring verified professionals directly to your door.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {[Twitter, Github, Linkedin, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-800 hover:text-white hover:border-gray-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-900"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* 🌟 DYNAMIC LINKS COLUMNS */}
          <div className="md:col-span-8 lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Column 1 */}
            <div>
              <h4 className="font-bold text-gray-100 tracking-wider mb-6 text-sm uppercase">
                {content.col1.title}
              </h4>
              <ul className="space-y-4 text-sm text-gray-400">
                {content.col1.links.map((link, i) => (
                  <li key={i}>
                    <Link
                      to={link.path}
                      className="group flex items-center hover:text-white transition-colors duration-300 w-fit"
                    >
                      <span className="group-hover:translate-x-1.5 transition-transform duration-300 ease-out">
                        {link.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="font-bold text-gray-100 tracking-wider mb-6 text-sm uppercase">
                {content.col2.title}
              </h4>
              <ul className="space-y-4 text-sm text-gray-400">
                {content.col2.links.map((link, i) => (
                  <li key={i}>
                    <Link
                      to={link.path}
                      className="group flex items-center hover:text-white transition-colors duration-300 w-fit"
                    >
                      <span className="group-hover:translate-x-1.5 transition-transform duration-300 ease-out">
                        {link.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 🌟 DYNAMIC CTA COLUMN */}
            <div className="col-span-2 sm:col-span-1 mt-4 sm:mt-0">
              <h4 className="font-bold text-gray-100 tracking-wider mb-6 text-sm uppercase">
                {content.cta.title}
              </h4>
              <Link
                to={content.cta.path}
                className="group inline-flex items-center gap-2 bg-white text-gray-900 px-5 py-3 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]"
              >
                {content.cta.btnText}{" "}
                <ArrowRight
                  size={16}
                  className="text-gray-900 group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="border-t border-gray-800/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm font-medium">
            &copy; {currentYear} LocalHub Inc. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 text-sm font-medium text-gray-500">
            <Link to="/" className="hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/" className="hover:text-gray-300 transition-colors">
              Terms of Service
            </Link>
            <Link to="/" className="hover:text-gray-300 transition-colors">
              Cookie Settings
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
