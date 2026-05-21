import { useState } from "react";
import AuthModal from "./AuthModal";

function Navbar() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("signin");

  const isLoggedIn = localStorage.getItem("user");

  const goTo = (id) => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const openModal = (type) => {
    setMode(type);
    setOpen(true);
  };

  const logout = () => {
    localStorage.removeItem("user");
    alert("Logged out ❌");
    window.location.reload(); // refresh UI
  };

  return (
    <>
      <nav className="navbar">
        <h2>DebateAI</h2>

        <ul className="nav-links">
          <li onClick={() => goTo("home")}>Home</li>
          <li onClick={() => goTo("features")}>Features</li>
          <li onClick={() => goTo("about")}>About</li>
          <li onClick={() => goTo("contact")}>Contact</li>
        </ul>

        <div className="nav-btns">
          {!isLoggedIn ? (
            <>
              <button onClick={() => openModal("signin")}>Sign In</button>
              <button onClick={() => openModal("signup")}>Sign Up</button>
            </>
          ) : (
            <button onClick={logout}>Logout</button>
          )}
        </div>
      </nav>

      {open && (
        <AuthModal
          close={setOpen}
          mode={mode}
        />
      )}
    </>
  );
}

export default Navbar;