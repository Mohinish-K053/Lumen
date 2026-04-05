import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Particles from "react-tsparticles";
import CountUp from "react-countup";
import Tilt from "react-parallax-tilt";
import { useEffect, useState } from "react";

function Home() {

  // Scroll progress indicator
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const progress =
        (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">

      {/* Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-purple-400 z-50"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Particle Background */}
      <Particles
        className="absolute inset-0 -z-10"
        options={{
          background: { color: "transparent" },
          particles: {
            number: { value: 60 },
            size: { value: 2 },
            move: { enable: true, speed: 0.5 },
            opacity: { value: 0.5 },
            links: { enable: true, color: "#ffffff", opacity: 0.2 }
          }
        }}
      />

      <Navbar />

      {/* HERO SECTION */}
      <section className="pt-40 pb-32 px-6 text-center max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl md:text-7xl font-extrabold"
        >
          AI-Driven Cognitive Intelligence
        </motion.h1>

        <p className="mt-8 text-lg md:text-2xl text-gray-200">
          Real-time monitoring. Adaptive learning. Cloud-native AI system.
        </p>

        <div className="mt-12 flex justify-center gap-6 flex-wrap">
          <button
            onClick={() => {
              const section = document.getElementById("features");
              section?.scrollIntoView({ behavior: "smooth" });
            }}
            className="relative px-8 py-4 font-semibold rounded-xl overflow-hidden group"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 animate-pulse blur-md"></span>
            <span className="relative bg-black px-8 py-4 rounded-xl">
              Get Started
            </span>
          </button>

        </div>
      </section>

      {/* STATISTICS COUNTER */}
      <section className="py-24 px-6 text-center bg-white/5 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          {[
            { label: "Active Users", value: 5000 },
            { label: "Sessions Monitored", value: 25000 },
            { label: "Accuracy Rate", value: 96 }
          ].map((stat, index) => (
            <motion.div key={index}>
              <h2 className="text-5xl font-bold text-purple-300">
                <CountUp end={stat.value} duration={3} />+
              </h2>
              <p className="mt-4 text-gray-200">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PARALLAX SECTION */}
      <section
        className="py-32 px-6 bg-fixed bg-center bg-cover"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1677442136019-21780ecad995')"
        }}
      >
        <div className="bg-black/60 backdrop-blur-md p-16 rounded-3xl max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold">
            Intelligent Learning Adaptation
          </h2>
          <p className="mt-6 text-gray-200">
            Powered by CNN + LSTM deep learning models.
          </p>
        </div>
      </section>

      {/* 3D TILT FEATURE CARDS */}
      <section id="features" className="py-24 px-6">
        <h2 className="text-4xl font-bold text-center mb-16">
          Core Features
        </h2>

        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            "Real-Time Monitoring",
            "Cloud Native AWS Deployment",
            "Big Data Analytics",
            "Secure JWT Authentication",
            "Scalable Architecture",
            "Adaptive AI Engine"
          ].map((feature, index) => (
            <Tilt
              key={index}
              glareEnable={true}
              glareMaxOpacity={0.3}
              scale={1.05}
              className="bg-white/10 p-8 rounded-3xl border border-white/20 shadow-xl"
            >
              <h3 className="text-xl font-semibold text-center">
                {feature}
              </h3>
            </Tilt>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 text-center px-6">
        <h2 className="text-4xl md:text-5xl font-bold">
          Ready to Transform Learning?
        </h2>

        <Link
          to="/register"
          className="mt-10 inline-block bg-purple-600 hover:bg-purple-700 px-10 py-4 rounded-2xl text-lg font-semibold transition transform hover:scale-110 shadow-2xl"
        >
          Start Now
        </Link>
      </section>

      <footer className="text-center py-10 border-t border-white/20 text-gray-300">
        © 2026 Lumen | Cognitive Intelligence Platform
      </footer>
    </div>
  );
}

export default Home;
