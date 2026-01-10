import { useGame } from '../../contexts/GameContext';
import { text } from '../../constants/text';
import './InspectionPanel.css';

const InspectionPanel = () => {
  const { currentInspectionText } = useGame();

  return (
    <div className="inspection-panel">
      <div className="inspection-panel-header">
        <h3>Inspection</h3>
      </div>
      <div className="inspection-panel-content">
        {currentInspectionText ? (
          <p>{currentInspectionText}</p>
        ) : (
          <p className="inspection-placeholder">{text.noInspectionText}</p>
        )}
      </div>
    </div>
  );
};

export default InspectionPanel;
