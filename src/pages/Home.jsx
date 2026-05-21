import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";

function Home({ setPage }) {
  return (
    <div className="app">
      <div className="bg-glow one"></div>
      <div className="bg-glow two"></div>

      <Navbar />

      <Hero setPage={setPage} />

      <Features />

      <section className="info-section" id="about">
        <h2>About DebateAI</h2>
        <p>
          DebateAI helps students improve speaking confidence, logic building,
          and communication skills using AI voice practice.
        </p>
      </section>

      <section className="info-section" id="contact">
        <h2>Contact</h2>
        <p>Email: support@debateai.com</p>
      </section>
    </div>
  );
}

export default Home;