import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import API from "../api/axios";

function Dashboard() {
  const navigate = useNavigate();
  const [weekly, setWeekly] = useState(null);
  const [load, setLoad] = useState(null);
  const [productivity, setProductivity] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [weeklyRes, loadRes, prodRes] = await Promise.all([
        API.get("/analytics/weekly"),
        API.get("/analytics/load"),
        API.get("/analytics/productivity"),
      ]);
      setWeekly(weeklyRes.data);
      setLoad(loadRes.data);
      setProductivity(prodRes.data);

      // Build chart data from daily breakdown
      const breakdown = weeklyRes.data.daily_breakdown || {};
      const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
      setChartData(days.map((d) => ({ name: d.slice(0,3), sessions: breakdown[d] || 0 })));
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    
    <div className="min-h-screen text-white px-6 py-12">
      <Navbar />

      {/* HEADER */}
      <div className="flex justify-between pt-20 items-center mb-12">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-5xl font-bold"
        >
          Dashboard Overview
        </motion.h1>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {[
          { title: "Sessions This Week", value: weekly?.total_sessions_this_week ?? "..." },
          { title: "Completed Sessions", value: weekly?.completed_sessions ?? "..." },
          { title: "Most Productive Hour", value: productivity?.most_productive_hour ?? "..." },
          { title: "Avg Session Duration", value: productivity?.avg_session_duration_minutes ? `${productivity.avg_session_duration_minutes}m` : "..." },
        ].map((card, index) => (
          <Tilt
            key={index}
            glareEnable={true}
            glareMaxOpacity={0.2}
            scale={1.05}
            className="bg-white/10 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 shadow-xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <h3 className="text-lg text-gray-300">{card.title}</h3>
              <p className="text-3xl font-bold mt-4 text-purple-300">{card.value}</p>
            </motion.div>
          </Tilt>
        ))}
      </div>

      {/* CHART */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white/10 backdrop-blur-2xl p-10 rounded-3xl border border-white/20 shadow-2xl mb-16"
      >
        <h2 className="text-2xl font-bold mb-6">Weekly Sessions</h2>
        <div className="w-full h-80 min-w-0">
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Line type="monotone" dataKey="sessions" stroke="#a855f7" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* LIVE STATUS + SESSION */}
      <div className="grid md:grid-cols-2 gap-10">

        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-purple-600/30 to-indigo-600/30 p-10 rounded-3xl border border-white/20 shadow-xl"
        >
          <h2 className="text-2xl font-bold mb-4">Load Distribution</h2>
          <div className="space-y-4 mt-6">
            {["Low Load", "Optimal Load", "High Load"].map((label, i) => {
              const colors = ["bg-green-500", "bg-purple-400", "bg-red-500"];
              const value = load?.[label] ?? 0;
              const total = load ? Object.values(load).reduce((a, b) => a + b, 0) : 1;
              const pct = total > 0 ? Math.round((value / total) * 100) : 0;
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{label}</span><span>{pct}%</span>
                  </div>
                  <div className="w-full bg-white/20 h-3 rounded-full">
                    <div className={`${colors[i]} h-3 rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/10 backdrop-blur-2xl p-10 rounded-3xl border border-white/20 shadow-xl"
        >
          <h2 className="text-2xl font-bold mb-6">Active Study Session</h2>
          <p className="text-gray-300 mb-6">
            Ready to study? Start a new session and let Lumen monitor your cognitive load in real time.
          </p>
          <button
            onClick={() => navigate("/study")}
            className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-xl font-semibold transition transform hover:scale-105"
          >
            Go to Study Session
          </button>
        </motion.div>

      </div>
    </div>
  );
}

export default Dashboard;