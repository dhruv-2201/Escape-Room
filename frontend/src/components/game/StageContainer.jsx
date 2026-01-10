import SceneImage from './SceneImage';
import InspectionPanel from './InspectionPanel';
import LockPanel from './LockPanel';
import InventoryPanel from './InventoryPanel';
import './StageContainer.css';

const StageContainer = () => {
  return (
    <div className="stage-container">
      <div className="stage-scene-section">
        <SceneImage />
        <InspectionPanel />
      </div>
      <div className="stage-interaction-section">
        <InventoryPanel />
        <LockPanel />
      </div>
    </div>
  );
};

export default StageContainer;
