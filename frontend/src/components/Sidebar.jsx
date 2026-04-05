import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function Sidebar({ isOpen, setIsOpen }) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <motion.div
        initial={{ x: -250 }}
        animate={{ x: isOpen ? 0 : -250 }}
        transition={{ duration: 0.3 }}
        className="fixed md:static z-50 w-64 h-full bg-white shadow-lg"
      >
        <div className="p-6 text-xl font-bold border-b text-indigo-600">
          Study AI
        </div>

        <nav className="p-4 space-y-2">
          {[
            { name: "Dashboard", path: "/dashboard" },
            { name: "Start Study", path: "/study" },
            { name: "Analytics", path: "/analytics" },
            { name: "Profile", path: "/profile" },
          ].map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="block p-3 rounded-lg hover:bg-indigo-50 transition"
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </motion.div>
    </>
  );
}

export default Sidebar;
