import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

function StudySession() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const loadIntervalRef = useRef(null);

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [focusMode, setFocusMode] = useState(false);
  const [load, setLoad] = useState(0);

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, isPaused]);

  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  /* ---------------- START SESSION ---------------- */
  const startSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setIsRunning(true);
      setIsPaused(false);

      // Simulated real-time load
      loadIntervalRef.current = setInterval(() => {
        setLoad(Math.floor(Math.random() * 100));
      }, 2000);

    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  /* ---------------- PAUSE ---------------- */
  const pauseSession = () => {
    setIsPaused(true);
  };

  /* ---------------- RESUME ---------------- */
  const resumeSession = () => {
    setIsPaused(false);
  };

  /* ---------------- STOP ---------------- */
  const stopSession = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    clearInterval(timerRef.current);
    clearInterval(loadIntervalRef.current);

    setIsRunning(false);
    setIsPaused(false);
    setSeconds(0);
    setLoad(0);
  };

  /* ---------------- LOAD COLOR ---------------- */
  const loadColor =
    load > 80 ? "bg-red-500" :
    load > 50 ? "bg-yellow-400" :
    "bg-green-500";

  return (
    <div
      className={`min-h-screen text-white px-6 py-10 transition-all duration-500 ${
        focusMode ? "bg-black" : ""
      }`}
    >
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-4xl font-bold mb-8"
      >
        Live Study Session
      </motion.h1>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* 🎥 WEBCAM */}
        <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full h-[500px] object-cover"
          />
        </div>

        {/* 🎛 CONTROL PANEL */}
        <div className="bg-gradient-to-br from-purple-600/30 to-indigo-600/30 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl">
          <h2 className="text-xl mb-4">Session Control</h2>

          {/* TIMER */}
          <p className="text-3xl font-bold mb-6">{formatTime()}</p>

          {/* REAL-TIME LOAD */}
          <div className="mb-6">
            <p className="text-sm mb-2">Cognitive Load: {load}%</p>
            <div className="w-full bg-white/20 h-4 rounded-full">
              <div
                className={`${loadColor} h-4 rounded-full transition-all duration-500`}
                style={{ width: `${load}%` }}
              />
            </div>
          </div>

          {/* BUTTONS */}
          {!isRunning && (
            <button
              onClick={startSession}
              className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl font-semibold mb-4"
            >
              🔴 Start
            </button>
          )}

          {isRunning && !isPaused && (
            <button
              onClick={pauseSession}
              className="w-full bg-yellow-500 hover:bg-yellow-600 py-3 rounded-xl font-semibold mb-4"
            >
              ⏸ Pause
            </button>
          )}

          {isRunning && isPaused && (
            <button
              onClick={resumeSession}
              className="w-full bg-blue-500 hover:bg-blue-600 py-3 rounded-xl font-semibold mb-4"
            >
              ▶ Resume
            </button>
          )}

          {isRunning && (
            <button
              onClick={stopSession}
              className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl font-semibold mb-4"
            >
              ⛔ Stop
            </button>
          )}

          {/* FOCUS MODE */}
          <button
            onClick={() => setFocusMode(!focusMode)}
            className="w-full border border-white/40 py-3 rounded-xl"
          >
            {focusMode ? "Exit Focus Mode" : "🌙 Focus Mode"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default StudySession;
