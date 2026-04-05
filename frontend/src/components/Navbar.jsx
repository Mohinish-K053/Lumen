import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full top-0 z-50 backdrop-blur-md bg-white/10 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative">

        {/* LEFT - LOGO */}
        <motion.h1
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xl md:text-2xl font-bold tracking-wide text-white"
        >
          Lumen
        </motion.h1>

        {/* CENTER - NAV LINKS (DESKTOP) */}
        <div className="hidden md:flex space-x-8 absolute left-1/2 transform -translate-x-1/2">
          {["Dashboard", "Analytics", "Study"].map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/${item.toLowerCase()}`}
                className="text-white font-medium hover:text-purple-200 transition relative group"
              >
                {item}
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-purple-300 transition-all group-hover:w-full"></span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* RIGHT - LOGIN BUTTON */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden md:block"
        >
          <Link
            to="/login"
            className="bg-white text-purple-700 px-5 py-2 rounded-lg font-semibold hover:scale-105 hover:shadow-lg transition transform"
          >
            Login
          </Link>
        </motion.div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.4 }}
          className="md:hidden bg-white/10 backdrop-blur-md px-6 py-4 space-y-4"
        >
          <Link to="/dashboard" className="block text-white">
            Dashboard
          </Link>
          <Link to="/analytics" className="block text-white">
            Analytics
          </Link>
          <Link to="/study" className="block text-white">
            Study
          </Link>
          <Link to="/login" className="block text-white font-semibold">
            Login
          </Link>
        </motion.div>
      )}
    </nav>
  );
}

export default Navbar;
