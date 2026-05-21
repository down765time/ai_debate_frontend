import { useState } from "react";
import DemoModal from "./DemoModal";
import AuthModal from "./AuthModal";

function Hero({ setPage }) {
  const [demoOpen, setDemoOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const handleStart = () => {
    const isLoggedIn = localStorage.getItem("user");

    if (!isLoggedIn) {
      setAuthOpen(true);
    } else {
      setPage("debate");
    }
  };

  return (
    <>
      <section className="hero" id="home">
        <h1>
          Practice Debates with <span>AI Voice Partner</span> 🎤
        </h1>

        <p>
          Improve confidence, fluency and logic through realistic AI powered
          debate simulations.
        </p>

        <div className="buttons">
          <button className="primary" onClick={handleStart}>
            Start Debate
          </button>

          <button className="secondary" onClick={() => setDemoOpen(true)}>
            Watch Demo
          </button>
        </div>
      </section>

      {demoOpen && <DemoModal close={setDemoOpen} />}
      {authOpen && <AuthModal close={setAuthOpen} mode="signin" />}
    </>
  );
}

export default Hero;