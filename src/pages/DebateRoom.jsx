import { useState, useRef } from "react";
import "./DebateRoom.css";

// ─────────────────────────────────────────────
// BACKEND URL
// ─────────────────────────────────────────────
const BACKEND_URL = "https://debateaibackend-production.up.railway.app";

function DebateRoom({ setPage }) {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Welcome to DebateAI. Press mic and present your argument.",
    },
  ]);

  const [recording, setRecording] = useState(false);
  const [typing, setTyping] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [scores, setScores] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // ─────────────────────────────────────────
  // WAV CONVERTER
  // ─────────────────────────────────────────

  async function convertToWav(blob) {
    const audioContext = new AudioContext({
      sampleRate: 16000,
    });

    const arrayBuffer = await blob.arrayBuffer();

    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const offlineContext = new OfflineAudioContext(
      1,
      audioBuffer.duration * 16000,
      16000
    );

    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start(0);

    const renderedBuffer = await offlineContext.startRendering();

    const wavBuffer = audioBufferToWav(renderedBuffer);

    return new Blob([wavBuffer], { type: "audio/wav" });
  }

  function audioBufferToWav(buffer) {
    const length = buffer.length * 2 + 44;

    const arrayBuffer = new ArrayBuffer(length);

    const view = new DataView(arrayBuffer);

    const channelData = buffer.getChannelData(0);

    let offset = 0;

    const writeString = (str) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset++, str.charCodeAt(i));
      }
    };

    writeString("RIFF");

    view.setUint32(offset, 36 + channelData.length * 2, true);
    offset += 4;

    writeString("WAVE");

    writeString("fmt ");

    view.setUint32(offset, 16, true);
    offset += 4;

    view.setUint16(offset, 1, true);
    offset += 2;

    view.setUint16(offset, 1, true);
    offset += 2;

    view.setUint32(offset, 16000, true);
    offset += 4;

    view.setUint32(offset, 16000 * 2, true);
    offset += 4;

    view.setUint16(offset, 2, true);
    offset += 2;

    view.setUint16(offset, 16, true);
    offset += 2;

    writeString("data");

    view.setUint32(offset, channelData.length * 2, true);
    offset += 4;

    for (let i = 0; i < channelData.length; i++, offset += 2) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));

      view.setInt16(
        offset,
        sample < 0 ? sample * 0x8000 : sample * 0x7fff,
        true
      );
    }

    return arrayBuffer;
  }

  // ─────────────────────────────────────────
  // START RECORDING
  // ─────────────────────────────────────────

  const startRecording = async () => {
    setErrorMsg("");
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const webmBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        const wavBlob = await convertToWav(webmBlob);

        await sendToBackend(wavBlob);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();

      setRecording(true);

    } catch (err) {
      setErrorMsg(
        "Mic access denied. Please allow microphone permission."
      );

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
  // SEND TO BACKEND
  // ─────────────────────────────────────────

  const sendToBackend = async (audioBlob) => {
    try {
      const formData = new FormData();

      formData.append("file", audioBlob, "recording.wav");

      const response = await fetch(`${BACKEND_URL}/debate`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();

      if (data.transcript) {
        setMessages((prev) => [
          ...prev,
          { sender: "user", text: data.transcript },
        ]);
      }

      if (data.reply_text) {
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: data.reply_text },
        ]);
      }

      if (data.score) {
        setScores({
          clarity: data.clarity,
          logic: data.logic,
          evidence: data.evidence,
          persuasiveness: data.persuasiveness,
          rebuttal_strength: data.rebuttal_strength,
          score: data.score,
          feedback: data.feedback,
        });
      }

      if (data.response_audio_file) {
        const audio = new Audio(
          `${BACKEND_URL}/download/${data.response_audio_file}`
        );

        audio.play();
      }

    } catch (err) {
      setErrorMsg(
        "Backend se connect nahi ho saka. Backend run kar lein pehle."
      );

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Sorry, koi error aa gayi. Backend check karein.",
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  // ─────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────

  return (
    <div className="debate-room">

      <nav className="navbar">
        <h2>DebateAI</h2>

        <div className="nav-btns">
          <button onClick={() => setPage("home")}>
            Back Home
          </button>
        </div>
      </nav>

      <section className="hero room-hero">
        <h1>🎤 Live Debate Room</h1>

        <p>Use your voice and challenge the AI opponent.</p>
      </section>

      {errorMsg && (
        <div
          style={{
            background: "#450a0a",
            color: "#fca5a5",
            padding: "12px 18px",
            borderRadius: "12px",
            maxWidth: "700px",
            margin: "16px auto 0",
            textAlign: "center",
          }}
        >
          ⚠️ {errorMsg}
        </div>
      )}

      <div className="chat-container">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-msg ${msg.sender}`}>
            {msg.text}
          </div>
        ))}

        {typing && (
          <div className="chat-msg ai">
            AI soch raha hai... ⏳
          </div>
        )}
      </div>

      {scores && (
        <div
          style={{
            maxWidth: "700px",
            margin: "30px auto 0",
            background: "#13233d",
            borderRadius: "18px",
            padding: "22px 26px",
          }}
        >
          <h3
            style={{
              color: "#38bdf8",
              marginBottom: "14px",
            }}
          >
            📊 Debate Score
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            {[
              ["Clarity", scores.clarity],
              ["Logic", scores.logic],
              ["Evidence", scores.evidence],
              ["Persuasiveness", scores.persuasiveness],
              ["Rebuttal Strength", scores.rebuttal_strength],
            ].map(([label, val]) => (
              <div
                key={label}
                style={{
                  background: "#1e293b",
                  borderRadius: "10px",
                  padding: "10px 14px",
                }}
              >
                <div
                  style={{
                    color: "#94a3b8",
                    fontSize: "13px",
                  }}
                >
                  {label}
                </div>

                <div
                  style={{
                    color: "#38bdf8",
                    fontSize: "20px",
                    fontWeight: "bold",
                  }}
                >
                  {val}/10
                </div>
              </div>
            ))}

            <div
              style={{
                background: "#1e293b",
                borderRadius: "10px",
                padding: "10px 14px",
              }}
            >
              <div
                style={{
                  color: "#94a3b8",
                  fontSize: "13px",
                }}
              >
                Overall Score
              </div>

              <div
                style={{
                  color: "#4ade80",
                  fontSize: "20px",
                  fontWeight: "bold",
                }}
              >
                {scores.score}/10
              </div>
            </div>
          </div>

          {scores.feedback && (
            <div
              style={{
                marginTop: "14px",
                color: "#cbd5e1",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              💡 <strong>Feedback:</strong> {scores.feedback}
            </div>
          )}
        </div>
      )}

      <div
        className="mic-wrap"
        style={{ marginBottom: "60px" }}
      >
        <button
          className={`mic-btn-big ${recording ? "pulse" : ""}`}
          onClick={recording ? stopRecording : startRecording}
          style={{
            background: recording ? "#ef4444" : "#38bdf8",
          }}
        >
          {recording ? "⏹" : "🎤"}
        </button>

        <p>
          {recording
            ? "Recording... (Dobara click karein rokne ke liye)"
            : "Tap to Speak"}
        </p>
      </div>
    </div>
  );
}

export default DebateRoom;
