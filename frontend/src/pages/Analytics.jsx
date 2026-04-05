import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";

function Analytics() {

  // Dummy Data (Will Replace With Backend Later)
  const weeklyData = [
    { day: "Mon", load: 40 },
    { day: "Tue", load: 70 },
    { day: "Wed", load: 55 },
    { day: "Thu", load: 80 },
    { day: "Fri", load: 60 },
    { day: "Sat", load: 50 },
    { day: "Sun", load: 65 },
  ];

  const distributionData = [
    { name: "Low", value: 25 },
    { name: "Optimal", value: 50 },
    { name: "High", value: 25 },
  ];

  const COLORS = ["#22c55e", "#a855f7", "#ef4444"];

  const productivityData = [
    { week: "W1", score: 70 },
    { week: "W2", score: 85 },
    { week: "W3", score: 78 },
    { week: "W4", score: 92 },
  ];

  return (
    <div className="min-h-screen px-6 py-12 text-white">

      {/* PAGE TITLE */}
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
          { label: "Average Load", value: "65%" },
          { label: "Peak Focus Time", value: "10 AM" },
          { label: "Fatigue Detection", value: "Low" },
          { label: "Productivity Index", value: "89%" },
        ].map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className="bg-white/10 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 shadow-xl"
          >
            <h3 className="text-gray-300">{item.label}</h3>
            <p className="text-3xl font-bold mt-4 text-purple-300">
              {item.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* WEEKLY TREND LINE CHART */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/10 backdrop-blur-2xl p-10 rounded-3xl border border-white/20 shadow-xl mb-16"
      >
        <h2 className="text-2xl font-bold mb-6">
          Weekly Cognitive Load Trend
        </h2>

        <div className="w-full h-80">
          <ResponsiveContainer>
            <LineChart data={weeklyData}>
              <XAxis dataKey="day" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="load"
                stroke="#a855f7"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* GRID SECTION */}
      <div className="grid md:grid-cols-2 gap-12">

        {/* PIE CHART */}
        <motion.div className="bg-white/10 backdrop-blur-2xl p-10 rounded-3xl border border-white/20 shadow-xl">
          <h2 className="text-2xl font-bold mb-6">
            Load Distribution
          </h2>

          <div className="w-full h-80">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={distributionData}
                  dataKey="value"
                  outerRadius={100}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* BAR CHART */}
        <motion.div className="bg-white/10 backdrop-blur-2xl p-10 rounded-3xl border border-white/20 shadow-xl">
          <h2 className="text-2xl font-bold mb-6">
            Monthly Productivity Score
          </h2>

          <div className="w-full h-80">
            <ResponsiveContainer>
              <BarChart data={productivityData}>
                <XAxis dataKey="week" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip />
                <Bar dataKey="score" fill="#a855f7" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* INSIGHT SECTION */}
      <div className="mt-20 bg-gradient-to-br from-purple-600/30 to-indigo-600/30 p-10 rounded-3xl border border-white/20 shadow-xl">
        <h2 className="text-2xl font-bold mb-4">
          AI Insight Summary
        </h2>
        <p className="text-gray-200 leading-relaxed">
          Based on the analysis, your cognitive performance is highest during
          morning hours. Overload spikes were observed mid-week. Consider
          incorporating short breaks during peak load periods to maintain
          optimal productivity.
        </p>
      </div>

    </div>
  );
}

export default Analytics;
