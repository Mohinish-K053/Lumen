import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import API from "../api/axios";
import Navbar from "../components/Navbar";

function StudySession() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const predictIntervalRef = useRef(null);
  const canvasRef = useRef(null);
  const isProcessingRef = useRef(false);

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [focusMode, setFocusMode] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [emotion, setEmotion] = useState("--");
  const [cognitiveLoad, setCognitiveLoad] = useState("--");
  const [confidence, setConfidence] = useState(0);
  const [loadPercent, setLoadPercent] = useState(0);

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(() => setSeconds((p) => p + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, isPaused]);

  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  /* ---------------- CAPTURE FRAME ---------------- */
  const captureAndPredict = async (sid) => {
    // Skip if previous prediction still in flight
    if (isProcessingRef.current) return;
    if (!videoRef.current || !canvasRef.current) return;

    isProcessingRef.current = true;

    try {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          isProcessingRef.current = false;
          return;
        }
        try {
          const formData = new FormData();
          formData.append("frame", blob, "frame.jpg");
          const res = await API.post(`/session/predict/${sid}`, formData);
          const { emotion, cognitive_load, confidence } = res.data;

          setEmotion(emotion);
          setCognitiveLoad(cognitive_load);
          setConfidence(Math.round(confidence * 100));
          setLoadPercent(
            cognitive_load === "High Load" ? 85 :
            cognitive_load === "Optimal Load" ? 55 : 25
          );
        } catch (err) {
          console.error("Predict error:", err);
        } finally {
          isProcessingRef.current = false;
        }
      }, "image/jpeg", 0.92);
    } catch (err) {
      console.error("Capture error:", err);
      isProcessingRef.current = false;
    }
  };

  /* ---------------- START ---------------- */
  const startSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      const res = await API.post("/session/start");
      const sid = res.data.session_id;
      setSessionId(sid);
      setIsRunning(true);
      setIsPaused(false);
      isProcessingRef.current = false;

      // Predict every 5 seconds
      predictIntervalRef.current = setInterval(() => captureAndPredict(sid), 5000);
    } catch (err) {
      console.error("Start error:", err);
    }
  };

  /* ---------------- PAUSE ---------------- */
  const pauseSession = async () => {
    setIsPaused(true);
    clearInterval(predictIntervalRef.current);
    isProcessingRef.current = false;
    try { await API.post(`/session/pause/${sessionId}`); } catch (e) {}
  };

  /* ---------------- RESUME ---------------- */
  const resumeSession = async () => {
    setIsPaused(false);
    isProcessingRef.current = false;
    predictIntervalRef.current = setInterval(() => captureAndPredict(sessionId), 5000);
    try { await API.post(`/session/resume/${sessionId}`); } catch (e) {}
  };

  /* ---------------- STOP ---------------- */
  const stopSession = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;

    clearInterval(timerRef.current);
    clearInterval(predictIntervalRef.current);
    isProcessingRef.current = false;

    try { await API.post(`/session/stop/${sessionId}`); } catch (e) {}

    setIsRunning(false);
    setIsPaused(false);
    setSeconds(0);
    setSessionId(null);
    setEmotion("--");
    setCognitiveLoad("--");
    setLoadPercent(0);
  };

  const loadColor =
    cognitiveLoad === "High Load" ? "bg-red-500" :
    cognitiveLoad === "Optimal Load" ? "bg-purple-400" :
    "bg-green-500";

  return (
    <div className={`min-h-screen text-white pt-20 px-6 py-10 transition-all duration-500 ${focusMode ? "bg-black" : ""}`}>
      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />
      <Navbar/>

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-4xl font-bold mb-8"
      >
        Live Study Session
      </motion.h1>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* WEBCAM */}
        <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl overflow-hidden">
          <video ref={videoRef} autoPlay muted className="w-full h-[500px] object-cover" />
        </div>

        {/* CONTROL PANEL */}
        <div className="bg-gradient-to-br from-purple-600/30 to-indigo-600/30 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl">
          <h2 className="text-xl mb-4">Session Control</h2>

          {/* TIMER */}
          <p className="text-3xl font-bold mb-6">{formatTime()}</p>

          {/* EMOTION + LOAD */}
          <div className="mb-4 p-4 rounded-2xl bg-white/10">
            <p className="text-sm text-gray-300">Detected Emotion</p>
            <p className="text-xl font-bold capitalize">{emotion}</p>
          </div>

          <div className="mb-4 p-4 rounded-2xl bg-white/10">
            <p className="text-sm text-gray-300">Cognitive Load</p>
            <p className="text-xl font-bold">{cognitiveLoad}</p>
            <p className="text-xs text-gray-400 mt-1">Confidence: {confidence}%</p>
          </div>

          {/* LOAD BAR */}
          <div className="mb-6">
            <div className="w-full bg-white/20 h-4 rounded-full">
              <div
                className={`${loadColor} h-4 rounded-full transition-all duration-500`}
                style={{ width: `${loadPercent}%` }}
              />
            </div>
          </div>

          {/* BUTTONS */}
          {!isRunning && (
            <button onClick={startSession} className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl font-semibold mb-4">
              🔴 Start
            </button>
          )}
          {isRunning && !isPaused && (
            <button onClick={pauseSession} className="w-full bg-yellow-500 hover:bg-yellow-600 py-3 rounded-xl font-semibold mb-4">
              ⏸ Pause
            </button>
          )}
          {isRunning && isPaused && (
            <button onClick={resumeSession} className="w-full bg-blue-500 hover:bg-blue-600 py-3 rounded-xl font-semibold mb-4">
              ▶ Resume
            </button>
          )}
          {isRunning && (
            <button onClick={stopSession} className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl font-semibold mb-4">
              ⛔ Stop
            </button>
          )}

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