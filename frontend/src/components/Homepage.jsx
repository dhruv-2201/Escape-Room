import { useNavigate } from "react-router-dom";

function Homepage() {
  const navigate = useNavigate();

  const handlePlayClick = () => {
    navigate("/auth");
  };

  return (
    <div className="content">
      <h1 className="title">Welcome to the Escape Room</h1>
      <p className="subtitle">Let's start the game</p>
      <button className="play-button" onClick={handlePlayClick}>
        Play
      </button>
    </div>
  );
}

export default Homepage;
