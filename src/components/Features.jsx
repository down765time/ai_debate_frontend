function Features() {
  const show = (name) => {
    alert(name + " feature selected");
  };

  return (
    <section className="features" id="features">
      <div className="card" onClick={() => show("Voice Practice")}>
        <h3>🎙 Voice Practice</h3>
        <p>Speak naturally and improve communication skills.</p>
      </div>

      <div className="card" onClick={() => show("AI Opponent")}>
        <h3>🤖 AI Opponent</h3>
        <p>Get realistic counter arguments instantly.</p>
      </div>

      <div className="card" onClick={() => show("Analytics")}>
        <h3>📊 Analytics</h3>
        <p>Track confidence, logic and fluency growth.</p>
      </div>
    </section>
  );
}

export default Features;