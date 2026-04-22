import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";
import API from "../api/axios";

function Analytics() {
  const [weekly, setWeekly] = useState(null);
  const [load, setLoad] = useState(null);
  const [productivity, setProductivity] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [w, l, p] = await Promise.all([
        API.get("/analytics/weekly"),
        API.get("/analytics/load"),
        API.get("/analytics/productivity"),
      ]);
      setWeekly(w.data);
      setLoad(l.data);
      setProductivity(p.data);
    } catch (err) {
      console.error("Analytics error:", err);
    }
  };

  // Chart data
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const weeklyChartData = days.map((d) => ({
    day: d.slice(0, 3),
    sessions: weekly?.daily_breakdown?.[d] || 0,
  }));

  const distributionData = load ? [
    { name: "Low", value: load["Low Load"] || 0 },
    { name: "Optimal", value: load["Optimal Load"] || 0 },
    { name: "High", value: load["High Load"] || 0 },
  ] : [];

  const COLORS = ["#22c55e", "#a855f7", "#ef4444"];

  return (
    <div className="min-h-screen px-6 pt-20 py-12 text-white">
      <Navbar/>

      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-5xl font-bold mb-12"
      >
        Advanced Analytics
      </motion.h1>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {[
          { label: "Sessions This Week", value: weekly?.total_sessions_this_week ?? "..." },
          { label: "Most Productive Hour", value: productivity?.most_productive_hour ?? "..." },
          { label: "Avg Session Duration", value: productivity?.avg_session_duration_minutes ? `${productivity.avg_session_duration_minutes}m` : "..." },
          { label: "Completed Sessions", value: productivity?.total_completed_sessions ?? "..." },
        ].map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className="bg-white/10 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 shadow-xl"
          >
            <h3 className="text-gray-300">{item.label}</h3>
            <p className="text-3xl font-bold mt-4 text-purple-300">{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* WEEKLY LINE CHART */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/10 backdrop-blur-2xl p-10 rounded-3xl border border-white/20 shadow-xl mb-16"
      >
        <h2 className="text-2xl font-bold mb-6">Weekly Sessions</h2>
        <div className="w-full h-80 min-w-0">
          <ResponsiveContainer>
            <LineChart data={weeklyChartData}>
              <XAxis dataKey="day" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Line type="monotone" dataKey="sessions" stroke="#a855f7" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* PIE + BAR */}
      <div className="grid md:grid-cols-2 gap-12">

        <motion.div className="bg-white/10 backdrop-blur-2xl p-10 rounded-3xl border border-white/20 shadow-xl">
          <h2 className="text-2xl font-bold mb-6">Load Distribution</h2>
          <div className="w-full h-80 min-w-0">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={distributionData} dataKey="value" outerRadius={100}>
                  {distributionData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div className="bg-white/10 backdrop-blur-2xl p-10 rounded-3xl border border-white/20 shadow-xl">
          <h2 className="text-2xl font-bold mb-6">Load Counts</h2>
          <div className="w-full h-80 min-w-0">
            <ResponsiveContainer>
              <BarChart data={distributionData}>
                <XAxis dataKey="name" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip />
                <Bar dataKey="value" fill="#a855f7" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>

      {/* AI INSIGHT */}
      <div className="mt-20 bg-gradient-to-br from-purple-600/30 to-indigo-600/30 p-10 rounded-3xl border border-white/20 shadow-xl">
        <h2 className="text-2xl font-bold mb-4">AI Insight Summary</h2>
        <p className="text-gray-200 leading-relaxed">
          {productivity?.most_productive_hour && productivity.most_productive_hour !== "N/A"
            ? `Your cognitive performance peaks around ${productivity.most_productive_hour}. You have completed ${productivity.total_completed_sessions} sessions with an average duration of ${productivity.avg_session_duration_minutes} minutes. Keep maintaining this study rhythm for optimal results.`
            : "Complete a few study sessions to unlock your personalized AI insights. Lumen will analyze your cognitive patterns and give you tailored recommendations."}
        </p>
      </div>

    </div>
  );
}

export default Analytics;