import { useState, useRef } from "react";
import "./DebateRoom.css";

// ─────────────────────────────────────────────
// BACKEND URL — jab backend run ho raha ho
// ─────────────────────────────────────────────
const BACKEND_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "https://debateaibackend-production.up.railway.app/debate";

function DebateRoom({ setPage }) {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Welcome to DebateAI. Press mic and present your argument.",
    },
  ]);

  const [recording, setRecording]   = useState(false);
  const [typing, setTyping]         = useState(false);
  const [errorMsg, setErrorMsg]     = useState("");
  const [scores, setScores]         = useState(null);   // debate scores

  // Refs for MediaRecorder
  const mediaRecorderRef = useRef(null);
  const audioChunksRef   = useRef([]);

  // ─────────────────────────────────────────
  // START RECORDING
  // ─────────────────────────────────────────
  const startRecording = async () => {
    setErrorMsg("");
    audioChunksRef.current = [];

    try {
      // Ask browser for mic permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Collect audio chunks as they come
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // When recording stops — send to backend
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await sendToBackend(audioBlob);

        // Stop all mic tracks (release mic)
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);

    } catch (err) {
      setErrorMsg("Mic access denied. Please allow microphone permission.");
      setRecording(false);
    }
  };

  // ─────────────────────────────────────────
  // STOP RECORDING
  // ─────────────────────────────────────────
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      setTyping(true);
    }
  };

  // ─────────────────────────────────────────
  // SEND AUDIO TO BACKEND
  // ─────────────────────────────────────────
  const sendToBackend = async (audioBlob) => {
    try {
      // Create form data with audio file
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");

      // POST to backend /debate endpoint
      const response = await fetch(`${BACKEND_URL}/debate`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();

      // Show user's transcribed text
      if (data.transcript) {
        setMessages((prev) => [
          ...prev,
          { sender: "user", text: data.transcript },
        ]);
      }

      // Show AI's counter-argument
      if (data.reply_text) {
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: data.reply_text },
        ]);
      }

      // Save scores for display
      if (data.score) {
        setScores({
          clarity:          data.clarity,
          logic:            data.logic,
          evidence:         data.evidence,
          persuasiveness:   data.persuasiveness,
          rebuttal_strength: data.rebuttal_strength,
          score:            data.score,
          feedback:         data.feedback,
        });
      }

      // Play AI voice response
      if (data.response_audio_file) {
        const audio = new Audio(
          `${BACKEND_URL}/download/${data.response_audio_file}`
        );
        audio.play();
      }

    } catch (err) {
      setErrorMsg("Backend se connect nahi ho saka. Backend run kar lein pehle.");
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Sorry, koi error aa gayi. Backend check karein." },
      ]);
    } finally {
      setTyping(false);
    }
  };

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <div className="debate-room">

      {/* Navbar */}
      <nav className="navbar">
        <h2>DebateAI</h2>
        <div className="nav-btns">
          <button onClick={() => setPage("home")}>Back Home</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero room-hero">
        <h1>🎤 Live Debate Room</h1>
        <p>Use your voice and challenge the AI opponent.</p>
      </section>

      {/* Error message */}
      {errorMsg && (
        <div style={{
          background: "#450a0a",
          color: "#fca5a5",
          padding: "12px 18px",
          borderRadius: "12px",
          maxWidth: "700px",
          margin: "16px auto 0",
          textAlign: "center"
        }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Chat messages */}
      <div className="chat-container">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-msg ${msg.sender}`}>
            {msg.text}
          </div>
        ))}

        {typing && (
          <div className="chat-msg ai">AI soch raha hai... ⏳</div>
        )}
      </div>

      {/* Scores — dikhein jab pehli response aaye */}
      {scores && (
        <div style={{
          maxWidth: "700px",
          margin: "30px auto 0",
          background: "#13233d",
          borderRadius: "18px",
          padding: "22px 26px",
        }}>
          <h3 style={{ color: "#38bdf8", marginBottom: "14px" }}>📊 Debate Score</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {[
              ["Clarity",           scores.clarity],
              ["Logic",             scores.logic],
              ["Evidence",          scores.evidence],
              ["Persuasiveness",    scores.persuasiveness],
              ["Rebuttal Strength", scores.rebuttal_strength],
            ].map(([label, val]) => (
              <div key={label} style={{ background: "#1e293b", borderRadius: "10px", padding: "10px 14px" }}>
                <div style={{ color: "#94a3b8", fontSize: "13px" }}>{label}</div>
                <div style={{ color: "#38bdf8", fontSize: "20px", fontWeight: "bold" }}>{val}/10</div>
              </div>
            ))}
            <div style={{ background: "#1e293b", borderRadius: "10px", padding: "10px 14px" }}>
              <div style={{ color: "#94a3b8", fontSize: "13px" }}>Overall Score</div>
              <div style={{ color: "#4ade80", fontSize: "20px", fontWeight: "bold" }}>{scores.score}/10</div>
            </div>
          </div>
          {scores.feedback && (
            <div style={{ marginTop: "14px", color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6" }}>
              💡 <strong>Feedback:</strong> {scores.feedback}
            </div>
          )}
        </div>
      )}

      {/* Mic button */}
      <div className="mic-wrap" style={{ marginBottom: "60px" }}>
        <button
          className={`mic-btn-big ${recording ? "pulse" : ""}`}
          onClick={recording ? stopRecording : startRecording}
          style={{ background: recording ? "#ef4444" : "#38bdf8" }}
        >
          {recording ? "⏹" : "🎤"}
        </button>
        <p>{recording ? "Recording... (Dobara click karein rokne ke liye)" : "Tap to Speak"}</p>
      </div>

    </div>
  );
}

export default DebateRoom;
