// PromotionSelection.jsx
import React from "react";
import Piece from "./Piece";

const PromotionSelection = ({ color, onPromote }) => {
  const promotionPieces = ["queen", "rook", "bishop", "knight"];
  return (
    <div className="promotion-selection">
      <h3>Choose a piece to promote to:</h3>
      <div className="promotion-options">
        {promotionPieces.map((pieceType) => (
          <div
            key={pieceType}
            onClick={() => onPromote(pieceType)}
            className="promotion-option"
            role="button"
          >
            <Piece type={pieceType} color={color} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromotionSelection;
