function DemoModal({ close }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box demo-box">
        <span className="close-btn" onClick={() => close(false)}>✖</span>

        <h2>DebateAI Demo</h2>

        <video width="100%" height="260" controls autoPlay muted>
          <source src="/public/demo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <p className="demo-text">
          Watch how AI debates with users in real-time using voice interaction.
        </p>
      </div>
    </div>
  );
}

export default DemoModal;