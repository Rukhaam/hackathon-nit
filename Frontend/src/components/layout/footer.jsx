import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Github, Twitter, Linkedin, Instagram, ArrowRight } from "lucide-react";
import { footerContent } from "../../utils/footerData";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const role = isAuthenticated && user ? user.role.toLowerCase() : "guest";
  const content = footerContent[role] || footerContent.guest;

  return (

    <footer className="relative mt-auto shrink-0 font-sans overflow-hidden scroll-auto border-t border-black/5 bg-white/70 backdrop-blur-2xl pt-24 pb-8 z-10 text-slate-950 selection:bg-black selection:text-white mt-10 ">
      
      {/* 🌟 SUBTLE AMBIENT ACCENTS (To give the blur depth) */}
      <div className="absolute top-[-30%] left-[20%] w-[600px] h-[300px] rounded-full bg-slate-100/50 blur-[100px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-[-10%] right-[30%] w-[400px] h-[200px] rounded-full bg-slate-100 blur-[80px] pointer-events-none -z-10"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="md:col-span-4 lg:col-span-5">
            <Link to="/" className="flex items-center gap-3 group mb-6 w-max">
              {/* Logo block is now solid black to contrast with light background */}
              <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-all duration-300">
                <span className="text-white font-extrabold text-xl leading-none">
                  L
                </span>
              </div>
              {/* Global Text Black */}
              <span className="font-extrabold text-2xl tracking-tight text-slate-950">
                LocalHub
              </span>
            </Link>
            {/* Softened Black for paragraph text */}
            <p className="text-slate-700 leading-relaxed text-sm max-w-sm mb-8 font-medium">
              The most elegant way to find, book, and manage premium local
              services. We bring verified professionals directly to your door.
            </p>

            {/* Darkened Glassy Social Icons */}
            <div className="flex items-center gap-3">
              {[Twitter, Github, Linkedin, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  // bg and border are now subtle dark translucent tints
                  className="w-10 h-10 rounded-full bg-black/[0.03] border border-black/5 flex items-center justify-center text-slate-600 hover:text-black hover:bg-black/[0.07] hover:border-black/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-sm"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* DYNAMIC LINKS COLUMNS (Global Text Black) */}
          <div className="md:col-span-8 lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            
            {/* Column 1 */}
            <div>
              <h4 className="font-bold text-slate-950 tracking-wider mb-6 text-sm uppercase">
                {content.col1.title}
              </h4>
              <ul className="space-y-4 text-sm text-slate-700 font-medium">
                {content.col1.links.map((link, i) => (
                  <li key={i}>
                    <Link
                      to={link.path}
                      className="group flex items-center hover:text-black transition-colors duration-300 w-fit"
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
              <h4 className="font-bold text-slate-950 tracking-wider mb-6 text-sm uppercase">
                {content.col2.title}
              </h4>
              <ul className="space-y-4 text-sm text-slate-700 font-medium">
                {content.col2.links.map((link, i) => (
                  <li key={i}>
                    <Link
                      to={link.path}
                      className="group flex items-center hover:text-black transition-colors duration-300 w-fit"
                    >
                      <span className="group-hover:translate-x-1.5 transition-transform duration-300 ease-out">
                        {link.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* DARK CTA COLUMN (Strong contrast against light glass) */}
            <div className="col-span-2 sm:col-span-1 mt-4 sm:mt-0">
              <h4 className="font-bold text-slate-950 tracking-wider mb-6 text-sm uppercase">
                {content.cta.title}
              </h4>
              <Link
                to={content.cta.path}
                className="group inline-flex items-center gap-2 bg-slate-950 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                {content.cta.btnText}{" "}
                <ArrowRight
                  size={16}
                  className="text-white/80 group-hover:translate-x-1 group-hover:text-white transition-all"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="border-t border-black/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm font-medium">
            &copy; {currentYear} LocalHub Inc. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 text-sm font-medium text-slate-500">
            <Link to="/" className="hover:text-black transition-colors">
              Privacy Policy
            </Link>
            <Link to="/" className="hover:text-black transition-colors">
              Terms of Service
            </Link>
            <Link to="/" className="hover:text-black transition-colors">
              Cookie Settings
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}