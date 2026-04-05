import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";

function Register() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">

      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-600 animate-gradientMove"></div>

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-10"
      >
        <h2 className="text-3xl font-bold text-center mb-8 text-white">
          Create Account
        </h2>

        <div className="mb-5">
          <label className="text-sm text-gray-200">Full Name</label>
          <input
            type="text"
            className="mt-2 w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        <div className="mb-5">
          <label className="text-sm text-gray-200">Email</label>
          <input
            type="email"
            className="mt-2 w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        <div className="mb-6 relative">
          <label className="text-sm text-gray-200">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            className="mt-2 w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-[42px] text-gray-300 text-sm"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-xl text-white font-semibold transition transform hover:scale-105">
          Register
        </button>

        <p className="mt-6 text-center text-gray-300 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-purple-300 hover:underline"
          >
            Login here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Register;
