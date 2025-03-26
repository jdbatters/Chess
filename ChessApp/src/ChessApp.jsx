import React, { useState, useEffect } from "react";
import Square from "./Square";
import Piece from "./Piece";
import PromotionSelection from "./PromotionSelection";
import {
  validateBishopMove,
  validateKnightMove,
  validateKingMove,
  validatePawnMove,
  isEnPassantMove,
  validateQueenMove,
  validateRookMove,
  isKingInCheck,
  isKingInCheckmate,
  doesMoveExposeKing,
  validateCastle,
  checkForStalemate,
  pawnPromotion,
} from "./GameLogic";
import NavigateMoveHistory from "./NavigateMoveHistory";

const initialBoard = [
  [
    <Piece type="rook" color="black" />,
    <Piece type="knight" color="black" />,
    <Piece type="bishop" color="black" />,
    <Piece type="queen" color="black" />,
    <Piece type="king" color="black" />,
    <Piece type="bishop" color="black" />,
    <Piece type="knight" color="black" />,
    <Piece type="rook" color="black" />,
  ],
  [
    <Piece type="pawn" color="black" />,
    <Piece type="pawn" color="black" />,
    <Piece type="pawn" color="black" />,
    <Piece type="pawn" color="black" />,
    <Piece type="pawn" color="black" />,
    <Piece type="pawn" color="black" />,
    <Piece type="pawn" color="black" />,
    <Piece type="pawn" color="black" />,
  ],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [
    <Piece type="pawn" color="white" />,
    <Piece type="pawn" color="white" />,
    <Piece type="pawn" color="white" />,
    <Piece type="pawn" color="white" />,
    <Piece type="pawn" color="white" />,
    <Piece type="pawn" color="white" />,
    <Piece type="pawn" color="white" />,
    <Piece type="pawn" color="white" />,
  ],
  [
    <Piece type="rook" color="white" />,
    <Piece type="knight" color="white" />,
    <Piece type="bishop" color="white" />,
    <Piece type="queen" color="white" />,
    <Piece type="king" color="white" />,
    <Piece type="bishop" color="white" />,
    <Piece type="knight" color="white" />,
    <Piece type="rook" color="white" />,
  ],
];

function ChessApp() {
  const [board, setBoard] = useState(initialBoard);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [whiteToMove, setWhiteToMove] = useState(true);
  const [whiteKingPosition, setWhiteKingPosition] = useState({
    row: 7,
    col: 4,
  });
  const [blackKingPosition, setBlackKingPosition] = useState({
    row: 0,
    col: 4,
  });
  const [lastMove, setLastMove] = useState(null);
  const [hasWhiteKingMoved, setHasWhiteKingMoved] = useState(false);
  const [hasBlackKingMoved, setHasBlackKingMoved] = useState(false);
  const [promotionChoice, setPromotionChoice] = useState(false);
  const [isWhiteInStalemate, setIsWhiteInStalemate] = useState(false);
  const [isBlackInStalemate, setIsBlackInStalemate] = useState(false);
  const [isWhiteInCheckmate, setIsWhiteInCheckmate] = useState(false);
  const [isBlackInCheckmate, setIsBlackInCheckmate] = useState(false);
  const [pendingMove, setPendingMove] = useState(null);
  const [boardHistory, setBoardHistory] = useState([initialBoard]);
  const [moveCount, setMoveCount] = useState(0);

  useEffect(() => {
    if (pendingMove) {
      const { selectedPiece, destination, movedPiece } = pendingMove;
      postMoveUpdates(selectedPiece, destination, movedPiece);
      setPendingMove(null);
    }
  }, [board]);

  const handleMove = (
    selectedPiece,
    row,
    col,
    board,
    setBoard,
    setLastMove
  ) => {
    const newBoard = board.map((r) => [...r]); // Create a deep copy of the board

    // Update the board with the move
    newBoard[row][col] = selectedPiece.piece;
    newBoard[selectedPiece.row][selectedPiece.col] = null;

    // Update the board state
    setBoard(newBoard);
    setBoardHistory([...boardHistory, newBoard]);
    setMoveCount(moveCount + 1);
    console.log(boardHistory);
    console.log(moveCount);

    // Update the last move
    const lastMove = {
      piece: selectedPiece.piece,
      start: { row: selectedPiece.row, col: selectedPiece.col },
      end: { row, col },
    };

    setLastMove(lastMove);
  };

  const postMoveUpdates = (selectedPiece, destination, movedPiece) => {
    const { row, col } = destination;
    const color = movedPiece.props.color;
    const type = movedPiece.props.type;
    let kingPosition =
      color === "white" ? whiteKingPosition : blackKingPosition;

    // Handle en passant capture
    if (isEnPassantMove(selectedPiece, { row, col }, lastMove)) {
      const captureRow = color === "white" ? row + 1 : row - 1;
      const newBoard = board.map((r) => [...r]);
      newBoard[captureRow][col] = null;
      setBoard(newBoard);
    }

    // Update king position if a king is moved
    if (type === "king") {
      if (color === "white") {
        setHasWhiteKingMoved(true);
        setWhiteKingPosition({ row, col });
        kingPosition = { row, col }; // Update local kingPosition
      } else {
        setHasBlackKingMoved(true);
        setBlackKingPosition({ row, col });
        kingPosition = { row, col }; // Update local kingPosition
      }
    }

    // Reset selected piece
    setSelectedPiece(null);
    setSelectedPosition(null);

    // Ensure kingPosition is defined before checking for check
    if (!kingPosition) {
      console.error("kingPosition is undefined");
      return;
    }

    // Check if kings are in check after the move
    const isWhiteKingInCheck = isKingInCheck(board, whiteKingPosition);
    const isBlackKingInCheck = isKingInCheck(board, blackKingPosition);

    // Check for checkmate
    const isWhiteKingInCheckmate =
      isWhiteKingInCheck && isKingInCheckmate(board, whiteKingPosition);
    const isBlackKingInCheckmate =
      isBlackKingInCheck && isKingInCheckmate(board, blackKingPosition);

    if (isWhiteKingInCheckmate) {
      setIsWhiteInCheckmate(true);
    }

    if (isBlackKingInCheckmate) {
      setIsBlackInCheckmate(true);
    }

    // Check for stalemate
    const stalemate = checkForStalemate(
      board,
      color === "white" ? blackKingPosition : whiteKingPosition,
      color === "white" ? "black" : "white",
      whiteKingPosition,
      blackKingPosition
    );
    if (stalemate) {
      if (color === "white") {
        setIsBlackInStalemate(true);
      } else {
        setIsWhiteInStalemate(true);
      }
    }
  };

  const handlePromotionChoice = (pieceType) => {
    const { selectedPiece, destination } = promotionChoice;
    const { row, col } = destination;
    const color = selectedPiece.piece.props.color;

    // Create the promoted piece
    const promotedPiece = <Piece type={pieceType} color={color} />;

    // Perform the move with the promoted piece
    handleMove(
      { ...selectedPiece, piece: promotedPiece },
      row,
      col,
      board,
      setBoard,
      setLastMove
    );

    // Clear the promotion choice state
    setPromotionChoice(null);

    // Set pending move for post-move updates
    setPendingMove({
      selectedPiece,
      destination: { row, col },
      movedPiece: promotedPiece,
    });
  };

  const handleSquareClick = (row, col) => {
    if (
      isWhiteInCheckmate ||
      isBlackInCheckmate ||
      isWhiteInStalemate ||
      isBlackInStalemate
    ) {
      return;
    }
    if (selectedPiece) {
      const { type, color } = selectedPiece.piece.props;
      if (selectedPiece.row === row && selectedPiece.col === col) {
        setSelectedPiece(null); // Deselect the piece
        setSelectedPosition(null);
      } else if (board[row][col] && board[row][col].props.color === color) {
        // Switch to new piece of the same color

        setSelectedPiece({ row, col, piece: board[row][col] });
        setSelectedPosition({ row, col });
      } else {
        let isValidMove = false;
        let isPromotion = false;
        const kingPosition =
          color === "white" ? whiteKingPosition : blackKingPosition;
        if (
          (whiteToMove && color === "white") ||
          (!whiteToMove && color === "black")
        ) {
          if (type === "king") {
            isValidMove =
              validateKingMove(
                board,
                selectedPiece,
                { row, col },
                whiteKingPosition,
                blackKingPosition
              ) &&
              !doesMoveExposeKing(
                selectedPiece,
                { row, col },
                board,
                color,
                kingPosition
              ); // Check for castling
            const castlingResult = validateCastle(
              board,
              { row: selectedPiece.row, col: selectedPiece.col },
              { row, col },
              kingPosition,
              color,
              color === "white" ? hasWhiteKingMoved : hasBlackKingMoved
            );
            if (castlingResult) {
              // Handle castling move
              const { kingNewPosition, rookNewPosition } = castlingResult;
              const newBoard = board.map((r) => [...r]); // Create a deep copy of the board // Update the king's position
              newBoard[kingNewPosition[0]][kingNewPosition[1]] =
                selectedPiece.piece;
              newBoard[selectedPiece.row][selectedPiece.col] = null; // Update the rook's position
              const rookPiece =
                newBoard[kingNewPosition[0]][kingNewPosition[1] === 2 ? 0 : 7];
              newBoard[rookNewPosition[0]][rookNewPosition[1]] = rookPiece;
              newBoard[kingNewPosition[0]][kingNewPosition[1] === 2 ? 0 : 7] =
                null; // Set the updated board state
              setBoard(newBoard);
              setLastMove({
                piece: selectedPiece.piece,
                start: { row: selectedPiece.row, col: selectedPiece.col },
                end: { row: kingNewPosition[0], col: kingNewPosition[1] },
              });
              if (color === "white") {
                setHasWhiteKingMoved(true);
              } else {
                setHasBlackKingMoved(true);
              }
              isValidMove = true; // Set isValidMove to true for castling
              setWhiteToMove((prevState) => !prevState); // Switch turns after castling

              setPendingMove({
                selectedPiece,
                destination: { row, col },
                movedPiece: selectedPiece.piece,
              });
              return;
            }
          }
          if (type === "queen") {
            isValidMove =
              validateQueenMove(board, selectedPiece, { row, col }) &&
              !doesMoveExposeKing(
                selectedPiece,
                { row, col },
                board,
                color,
                kingPosition
              );
          }
          if (type === "rook") {
            isValidMove =
              validateRookMove(board, selectedPiece, { row, col }, color) &&
              !doesMoveExposeKing(
                selectedPiece,
                { row, col },
                board,
                color,
                kingPosition
              );
          }
          if (type === "bishop") {
            isValidMove =
              validateBishopMove(board, selectedPiece, { row, col }) &&
              !doesMoveExposeKing(
                selectedPiece,
                { row, col },
                board,
                color,
                kingPosition
              );
          }
          if (type === "knight") {
            isValidMove =
              validateKnightMove(board, selectedPiece, { row, col }) &&
              !doesMoveExposeKing(
                selectedPiece,
                { row, col },
                board,
                color,
                kingPosition
              );
          }
          if (type === "pawn") {
            isValidMove =
              (validatePawnMove(board, selectedPiece, { row, col }, color) &&
                !doesMoveExposeKing(
                  selectedPiece,
                  { row, col },
                  board,
                  color,
                  kingPosition
                )) ||
              (isEnPassantMove(selectedPiece, { row, col }, lastMove) &&
                !doesMoveExposeKing(
                  selectedPiece,
                  { row, col },
                  board,
                  color,
                  kingPosition
                ));
            if (isValidMove && pawnPromotion({ row, col }, color)) {
              isPromotion = true;
            }
          }
          if (isValidMove) {
            if (isPromotion) {
              setPromotionChoice({ selectedPiece, destination: { row, col } });
              setWhiteToMove((prevState) => !prevState); // Switch turns after a promotion
            } else {
              handleMove(selectedPiece, row, col, board, setBoard, setLastMove);
              setPendingMove({
                selectedPiece,
                destination: { row, col },
                movedPiece: selectedPiece.piece,
              });
              setWhiteToMove((prevState) => !prevState); // Switch turns after a valid move
            }
          } else {
          }
        }
      }
    } else {
      const piece = board[row][col];
      if (
        piece &&
        ((whiteToMove && piece.props.color === "white") ||
          (!whiteToMove && piece.props.color === "black"))
      ) {
        setSelectedPiece({ row, col, piece });
        setSelectedPosition({ row, col });
      }
    }
  };

  return (
    <div className="chess-app">
      {isWhiteInStalemate && <h1>White is in stalemate!</h1>}
      {isBlackInStalemate && <h1>Black is in stalemate!</h1>}
      {isWhiteInCheckmate && <h1>White is in checkmate!</h1>}
      {isBlackInCheckmate && <h1>Black is in checkmate!</h1>}
      <div className="board">
        {board.map((row, rowIndex) =>
          row.map((square, colIndex) => (
            <Square
              key={`${rowIndex}-${colIndex}`}
              color={(rowIndex + colIndex) % 2 === 0 ? "white" : "black"}
              onClick={() =>
                handleSquareClick(
                  rowIndex,
                  colIndex,
                  (rowIndex + colIndex) % 2 === 0 ? "white" : "black"
                )
              }
            >
              {square &&
                React.cloneElement(square, {
                  isSelected:
                    selectedPosition &&
                    selectedPosition.row === rowIndex &&
                    selectedPosition.col === colIndex,
                })}
            </Square>
          ))
        )}

        {/* Render the promotion selection UI if needed */}
        {promotionChoice && (
          <PromotionSelection
            color={promotionChoice.selectedPiece.piece.props.color}
            onPromote={handlePromotionChoice}
          />
        )}
      </div>
      <NavigateMoveHistory
        moveHistory={boardHistory}
        currentMoveIndex={moveCount}
      />
    </div>
  );
}

export default ChessApp;
