import { useGame } from '../../contexts/GameContext';
import './SceneImage.css';

const SceneImage = ({ stage }) => {
  const { gameState, inspectScene } = useGame();

  const handleClick = () => {
    if (gameState?.currentStage) {
      inspectScene(gameState.currentStage);
    }
  };

  // Determine image source based on stage and state
  const getImageSource = () => {
    if (!gameState) return '/images/cell-scene.jpg';
    
    const currentStage = gameState.currentStage;
    
    if (currentStage === 'CELL') {
      if (gameState.cellDrawerUnlocked) {
        return '/images/cell-scene-drawer-open.jpg';
      }
      return '/images/cell-scene.jpg';
    } else if (currentStage === 'DESK') {
      if (gameState.deskDrawerUnlocked) {
        return '/images/desk-scene-drawer-open.jpg';
      }
      return '/images/desk-scene.jpg';
    } else if (currentStage === 'ESCAPED') {
      return '/images/escaped-scene.jpg';
    }
    
    return '/images/cell-scene.jpg';
  };

  return (
    <div className="scene-image-container">
      <img
        src={getImageSource()}
        alt={`${gameState?.currentStage || 'CELL'} scene`}
        className="scene-image"
        onClick={handleClick}
        onError={(e) => {
          // Fallback if image doesn't exist
          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+U2NlbmUgSW1hZ2U8L3RleHQ+PC9zdmc+';
        }}
      />
    </div>
  );
};

export default SceneImage;
