import React from "react";

function Piece({ type, color, onClick, isSelected }) {
  const pieceImages = {
    pawn: {
      white: "src/assets/whitePawn.png",
      black: "src/assets/blackPawn.png",
    },
    rook: {
      white: "src/assets/whiteRook.png",
      black: "src/assets/blackRook.png",
    },
    knight: {
      white: "src/assets/whiteKnight.png",
      black: "src/assets/blackKnight.png",
    },
    bishop: {
      white: "src/assets/whiteBishop.png",
      black: "src/assets/blackBishop.png",
    },
    king: {
      white: "src/assets/whiteKing.png",
      black: "src/assets/blackKing.png",
    },
    queen: {
      white: "src/assets/whiteQueen.png",
      black: "src/assets/blackQueen.png",
    },
  };

  const imageSrc = pieceImages[type] && pieceImages[type][color];

  const pieceStyle = {
    width: type === "queen" || type === "knight" ? "100%" : "90%", // Original size for queen and knight, 10% smaller for others
    height: type === "queen" || type === "knight" ? "100%" : "90%", // Original size for queen and knight, 10% smaller for others
    filter:
      color === "black"
        ? "drop-shadow(0 0 2px white)"
        : "drop-shadow(0 0 2px black)", // White outline for black pieces
  };

  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        filter: isSelected ? "drop-shadow(0 0 8px #7DF9FF)" : "none",
        height: "60px",
        width: "50px",
      }}
    >
      {imageSrc ? (
        <img src={imageSrc} alt={`${color} ${type}`} style={pieceStyle} />
      ) : (
        <div style={{ width: "100%", height: "100%", backgroundColor: "red" }}>
          Image not found
        </div>
      )}
    </button>
  );
}

export default Piece;
