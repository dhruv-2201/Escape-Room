import { useGame } from '../../contexts/GameContext';
import { text } from '../../constants/text';
import './InventoryPanel.css';

const InventoryPanel = () => {
  const { gameState, useItem } = useGame();

  if (!gameState) {
    return null;
  }

  const items = [];

  if (gameState.hasRod) {
    items.push({ id: 'rod', name: text.rod, item: 'rod' });
  }
  if (gameState.hasDeskKey) {
    items.push({ id: 'deskKey', name: text.deskKey, item: 'deskKey' });
  }
  if (gameState.hasMetalPiece) {
    items.push({ id: 'metalPiece', name: 'Metal Piece', item: 'metalPiece' });
  }

  const handleUseItem = async (item) => {
    await useItem(item);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="inventory-panel">
      <h3 className="inventory-panel-header">{text.inventory}</h3>
      <div className="inventory-items">
        {items.map((item) => (
          <div key={item.id} className="inventory-item">
            <span className="inventory-item-name">{item.name}</span>
            <button
              className="use-item-button"
              onClick={() => handleUseItem(item.item)}
            >
              {text.useItem}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryPanel;
