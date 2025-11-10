import { useNavigate } from "react-router-dom";
import { text } from "../constants/text";

function Homepage({ onPlay }) {
  const navigate = useNavigate();

  const handlePlayClick = () => {
    if (onPlay) {
      onPlay();
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="homepage-content">
      <div className="welcome-text">
        <h1 className="welcome-title">{text.welcomeTitle}</h1>
        <p className="welcome-subtitle">{text.welcomeSubtitle}</p>
      </div>
      <button className="play-button" onClick={handlePlayClick}>
        {text.playButton}
      </button>
    </div>
  );
}

export default Homepage;
