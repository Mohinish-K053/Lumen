import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../api/axios";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const res = await API.post("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user_id", res.data.user_id);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-600 animate-gradientMove"></div>
      <div className="absolute w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-30 animate-pulse top-[-100px] left-[-100px]" />
      <div className="absolute w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-30 animate-pulse bottom-[-100px] right-[-100px]" />

      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-10"
      >
        <h2 className="text-3xl font-bold text-center mb-8 text-white">
          Welcome Back
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-400 text-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="mb-5">
          <label className="text-sm text-gray-200">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="mt-2 w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        <div className="mb-6 relative">
          <label className="text-sm text-gray-200">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
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

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full relative overflow-hidden group rounded-xl py-3 font-semibold text-white"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 animate-pulse blur-md"></span>
          <span className="relative bg-black px-6 py-3 rounded-xl block">
            {loading ? "Logging in..." : "Login"}
          </span>
        </button>

        <p className="mt-6 text-center text-gray-300 text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-purple-300 hover:underline">
            Register here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Login;