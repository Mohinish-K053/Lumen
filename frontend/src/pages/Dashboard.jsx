import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {

  const data = [
    { name: "Mon", load: 40 },
    { name: "Tue", load: 65 },
    { name: "Wed", load: 50 },
    { name: "Thu", load: 80 },
    { name: "Fri", load: 55 },
    { name: "Sat", load: 70 },
    { name: "Sun", load: 60 },
  ];

  return (
    <div className="min-h-screen text-white px-6 py-12">

      {/* PAGE TITLE */}
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-4xl md:text-5xl font-bold mb-12"
      >
        Dashboard Overview
      </motion.h1>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">

        {[
          { title: "Total Study Time", value: "32h" },
          { title: "Sessions Completed", value: "18" },
          { title: "Average Load", value: "Optimal" },
          { title: "Focus Score", value: "92%" },
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
              <p className="text-3xl font-bold mt-4 text-purple-300">
                {card.value}
              </p>
            </motion.div>
          </Tilt>
        ))}
      </div>

      {/* CHART SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white/10 backdrop-blur-2xl p-10 rounded-3xl border border-white/20 shadow-2xl mb-16"
      >
        <h2 className="text-2xl font-bold mb-6">
          Weekly Cognitive Load Trend
        </h2>

        <div className="w-full h-80">
          <ResponsiveContainer>
            <LineChart data={data}>
              <XAxis dataKey="name" stroke="#ccc" />
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

      {/* LIVE STATUS SECTION */}
      <div className="grid md:grid-cols-2 gap-10">

        {/* LIVE LOAD CARD */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-purple-600/30 to-indigo-600/30 p-10 rounded-3xl border border-white/20 shadow-xl"
        >
          <h2 className="text-2xl font-bold mb-4">
            Current Cognitive State
          </h2>

          <div className="flex items-center justify-between mt-6">
            <span className="text-xl">Status:</span>
            <span className="px-4 py-2 rounded-full bg-green-500 text-white font-semibold">
              Optimal
            </span>
          </div>

          <div className="mt-8 w-full bg-white/20 rounded-full h-4">
            <div className="bg-purple-400 h-4 rounded-full w-3/4"></div>
          </div>
        </motion.div>

        {/* SESSION CARD */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/10 backdrop-blur-2xl p-10 rounded-3xl border border-white/20 shadow-xl"
        >
          <h2 className="text-2xl font-bold mb-6">
            Active Study Session
          </h2>

          <p className="text-gray-300 mb-6">
            Your session is currently running. Stay focused!
          </p>

          <button className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-xl font-semibold transition transform hover:scale-105">
            Go to Study Session
          </button>
        </motion.div>

      </div>

    </div>
  );
}

export default Dashboard;
