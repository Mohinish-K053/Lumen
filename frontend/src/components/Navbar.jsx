import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import API from "../api/axios";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      API.get("/auth/profile")
        .then((res) => setUser(res.data))
        .catch(() => setUser(null));
    } else {
      setUser(null);
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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

        {/* RIGHT - USER INFO + LOGOUT (DESKTOP) */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden md:flex items-center gap-3"
        >
          {token && user ? (
            <>
              {/* Avatar + Name pill */}
              <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1.5">
                {/* Avatar circle with initials */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold shadow-md">
                  {getInitials(user.name)}
                </div>
                {/* Name */}
                <span className="text-white text-sm font-medium max-w-[120px] truncate">
                  {user.name}
                </span>
                {/* Online dot */}
                <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.6)]"></span>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="bg-red-500/20 border border-red-400/50 text-red-300 px-4 py-2 rounded-lg font-semibold hover:scale-105 hover:bg-red-500/30 hover:shadow-lg transition transform text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-white text-purple-700 px-5 py-2 rounded-lg font-semibold hover:scale-105 hover:shadow-lg transition transform"
            >
              Login
            </Link>
          )}
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
          <Link to="/dashboard" className="block text-white">Dashboard</Link>
          <Link to="/analytics" className="block text-white">Analytics</Link>
          <Link to="/study" className="block text-white">Study</Link>

          {token && user ? (
            <>
              {/* Mobile user info */}
              <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-2 w-fit">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                  {getInitials(user.name)}
                </div>
                <span className="text-white text-sm font-medium">{user.name}</span>
                <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.6)]"></span>
              </div>
              <button
                onClick={handleLogout}
                className="block text-red-300 font-semibold w-full text-left"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="block text-white font-semibold">Login</Link>
          )}
        </motion.div>
      )}
    </nav>
  );
}

export default Navbar;