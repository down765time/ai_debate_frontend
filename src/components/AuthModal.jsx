function AuthModal({ close, mode }) {
  const handleAuth = () => {
    localStorage.setItem("user", "loggedIn");
    close(false);
    alert("Login Successful ✅");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <span className="close-btn" onClick={() => close(false)}>✖</span>

        <h2>{mode === "signin" ? "Sign In" : "Create Account"}</h2>

        <input type="email" placeholder="Email Address" />
        <input type="password" placeholder="Password" />

        {mode === "signup" && (
          <input type="text" placeholder="Full Name" />
        )}

        <button className="primary-btn" onClick={handleAuth}>
          {mode === "signin" ? "Login" : "Sign Up"}
        </button>
      </div>
    </div>
  );
}

export default AuthModal;