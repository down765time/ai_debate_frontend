import { useState } from "react";
import Home from "./pages/Home";
import DebateRoom from "./pages/DebateRoom";
import "./App.css";

function App() {
  const [page, setPage] = useState("home");

  return (
    <>
      {page === "home" ? (
        <Home setPage={setPage} />
      ) : (
        <DebateRoom setPage={setPage} />
      )}
    </>
  );
}

export default App;