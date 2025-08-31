import { Routes, Route } from "react-router-dom";
import Homepage from "./components/Homepage";
import AuthPage from "./components/AuthPage";
import "./App.css";

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </div>
  );
}

export default App;
