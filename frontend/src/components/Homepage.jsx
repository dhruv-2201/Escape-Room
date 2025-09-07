import { useNavigate } from "react-router-dom";

function Homepage() {
  const navigate = useNavigate();

  const handlePlayClick = () => {
    navigate("/login");
  };

  return (
    <div className="content">
      <h1 className="title">Welcome to the Escape Room</h1>
      <p className="subtitle">Do you have what it takes to escape?</p>
      <button className="play-button" onClick={handlePlayClick}>
        Play Now
      </button>
    </div>
  );
}

export default Homepage;
