import { BrowserRouter, Routes, Route } from "react-router-dom";
import VoiceOnlyHome from "./pages/VoiceOnlyHome";
import IntegratedVoiceScreening from "./pages/IntegratedVoiceScreening";
import IntegratedGameAnalysis from "./pages/IntegratedGameAnalysis";
import WordSearch from "./pages/WordSearch";
import MemoryMatch from "./pages/MemoryMatch";
import MathChallenge from "./pages/MathChallenge";
import JigsawPuzzle from "./pages/JigsawPuzzle";
import ShapeDrawing from "./pages/ShapeDrawing";

export default function VoiceOnlyApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VoiceOnlyHome />} />
        <Route path="/voice-screening" element={<IntegratedVoiceScreening />} />
        <Route path="/game-analysis" element={<IntegratedGameAnalysis />} />
        <Route path="/wordsearch" element={<WordSearch />} />
        <Route path="/memorymatch" element={<MemoryMatch />} />
        <Route path="/mathchallenge" element={<MathChallenge />} />
        <Route path="/jigsawpuzzle" element={<JigsawPuzzle />} />
        <Route path="/clockdrawing" element={<ShapeDrawing />} />
        <Route
          path="*"
          element={
            <div
              style={{
                padding: "50px",
                textAlign: "center",
                fontFamily: "Arial, sans-serif",
                minHeight: "100vh",
                backgroundColor: "#f8fafc",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: "4rem", marginBottom: "2rem" }}>🤔</div>
              <h1
                style={{
                  fontSize: "2rem",
                  marginBottom: "1rem",
                  color: "#1e293b",
                }}
              >
                Page Not Found
              </h1>
              <p
                style={{
                  fontSize: "1.1rem",
                  color: "#64748b",
                  marginBottom: "2rem",
                }}
              >
                The page you're looking for doesn't exist.
              </p>
              <button
                onClick={() => (window.location.href = "/")}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "500",
                }}
              >
                Go to Home
              </button>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
