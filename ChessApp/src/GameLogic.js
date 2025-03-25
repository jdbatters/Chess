export const validateRookMove = (board, start, end, color) => {
  const { row: startRow, col: startCol } = start;
  const { row: endRow, col: endCol } = end;

  if (startRow === endRow) {
    const step = startCol < endCol ? 1 : -1;
    for (let col = startCol + step; col !== endCol; col += step) {
      if (board[startRow][col]) return false; // Path blocked
    }
    return (
      !board[endRow][endCol] || board[endRow][endCol].props.color !== color
    );
  }

  if (startCol === endCol) {
    const step = startRow < endRow ? 1 : -1;
    for (let row = startRow + step; row !== endRow; row += step) {
      if (board[row][startCol]) return false; // Path blocked
    }
    return (
      !board[endRow][endCol] || board[endRow][endCol].props.color !== color
    );
  }

  return false; // Invalid rook move if not in the same row or column
};

export const validateBishopMove = (board, start, end) => {
  const { row: startRow, col: startCol } = start;
  const { row: endRow, col: endCol } = end;

  const rowDiff = Math.abs(startRow - endRow);
  const colDiff = Math.abs(startCol - endCol);

  if (rowDiff === colDiff) {
    const rowStep = startRow < endRow ? 1 : -1;
    const colStep = startCol < endCol ? 1 : -1;

    for (let i = 1; i < rowDiff; i++) {
      if (board[startRow + i * rowStep][startCol + i * colStep]) {
        return false;
      }
    }
    return true;
  }
  return false;
};

export const validateKnightMove = (board, start, end) => {
  const { row: startRow, col: startCol } = start;
  const { row: endRow, col: endCol } = end;

  const rowDiff = Math.abs(startRow - endRow);
  const colDiff = Math.abs(startCol - endCol);

  // A knight moves in an L-shape: 2 squares in one direction and 1 in the other
  return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
};

export const validatePawnMove = (board, start, end, color) => {
  const { row: startRow, col: startCol } = start;
  const { row: endRow, col: endCol } = end;

  const direction = color === "white" ? -1 : 1; // Determine direction based on color
  const initialPosition = color === "white" ? 6 : 1; // Determine starting row based on color

  // Moving forward by 1 square
  if (
    startRow + direction === endRow &&
    startCol === endCol &&
    !board[endRow][endCol]
  ) {
    return true;
  }

  // Moving forward by 2 squares from the initial position
  if (
    startRow === initialPosition &&
    startRow + 2 * direction === endRow &&
    startCol === endCol &&
    !board[endRow][endCol] &&
    !board[startRow + direction][endCol]
  ) {
    return true;
  }

  // Capturing diagonally
  if (
    startRow + direction === endRow &&
    Math.abs(startCol - endCol) === 1 &&
    board[endRow][endCol] &&
    board[endRow][endCol].props.color !== color
  ) {
    return true;
  }

  return false;
};

export const isEnPassantMove = (start, end, lastMove) => {
  if (
    lastMove &&
    lastMove.piece.props.type === "pawn" &&
    Math.abs(lastMove.start.row - lastMove.end.row) === 2 &&
    lastMove.end.row === start.row &&
    Math.abs(lastMove.end.col - start.col) === 1
  ) {
    // Adjust the expected row based on the direction of pawn movement
    const expectedRow =
      lastMove.end.row + (lastMove.piece.props.color === "white" ? 1 : -1);

    if (end.row === expectedRow && end.col === lastMove.end.col) {
      return true;
    }
  }
  return false;
};

export const validateQueenMove = (board, start, end) => {
  const startPiece = board[start.row][start.col];
  if (!startPiece || !startPiece.props) return false; // Ensure the piece and its properties exist

  const color = startPiece.props.color;
  return (
    validateRookMove(board, start, end, color) ||
    validateBishopMove(board, start, end)
  );
};

export const validateKingMove = (
  board,
  start,
  end,
  whiteKingPosition,
  blackKingPosition
) => {
  const rowDiff = Math.abs(start.row - end.row);
  const colDiff = Math.abs(start.col - end.col);

  // The king moves one square in any direction
  const isValidMove = rowDiff <= 1 && colDiff <= 1;

  // Ensure kings do not move to adjacent squares of each other
  const isAdjacentToOtherKing = (kingPosition) => {
    if (!kingPosition) return false;
    const rowDiff = Math.abs(end.row - kingPosition.row);
    const colDiff = Math.abs(end.col - kingPosition.col);
    return rowDiff <= 1 && colDiff <= 1;
  };

  const startPiece = board[start.row][start.col];

  if (isValidMove) {
    if (
      startPiece.props.color === "white" &&
      isAdjacentToOtherKing(blackKingPosition)
    ) {
      return false;
    }
    if (
      startPiece.props.color === "black" &&
      isAdjacentToOtherKing(whiteKingPosition)
    ) {
      return false;
    }
  }

  return isValidMove && !isKingInCheck(board, end);
};

export const doesMoveExposeKing = (start, end, board, color, kingPosition) => {
  // Create a temporary copy of the board
  const tempBoard = board.map((row) => [...row]);

  // Make the move on the temporary board
  tempBoard[end.row][end.col] = tempBoard[start.row][start.col];
  tempBoard[start.row][start.col] = null;

  // Determine the current king position if the piece being moved is the king
  let newKingPosition = kingPosition;
  if (tempBoard[end.row][end.col]?.props?.type === "king") {
    newKingPosition = { row: end.row, col: end.col };
  }

  // Ensure newKingPosition is defined before checking for check
  if (!newKingPosition) {
    console.error("newKingPosition is undefined");
    return false;
  }

  // Check if the move puts the king in check
  return isKingInCheck(tempBoard, newKingPosition);
};

export const isKingInCheck = (board, kingPosition) => {
  if (!kingPosition) {
    console.error("kingPosition is undefined");
    return false;
  }

  const { row: kingRow, col: kingCol } = kingPosition;
  const kingColor = board[kingRow][kingCol]?.props?.color;

  if (!kingColor) return false;

  const isThreatenedByPiece = (start, end) => {
    const piece = board[start.row][start.col];
    if (!piece || piece.props.color === kingColor) return false;

    switch (piece.props.type) {
      case "rook":
        return validateRookMove(board, start, end, piece.props.color);
      case "bishop":
        return validateBishopMove(board, start, end);
      case "queen":
        return validateQueenMove(board, start, end);
      case "knight":
        return validateKnightMove(board, start, end);
      case "pawn":
        return validatePawnMove(board, start, end, piece.props.color);
      default:
        return false;
    }
  };

  // Check for threats from all directions
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (isThreatenedByPiece({ row, col }, { row: kingRow, col: kingCol })) {
        return true;
      }
    }
  }

  return false;
};

export const isKingInCheckmate = (board, kingPosition) => {
  const { row: kingRow, col: kingCol } = kingPosition;
  const kingColor = board[kingRow][kingCol]?.props.color;

  if (!kingColor) return false;

  const isMoveValid = (start, end) => {
    const tempBoard = board.map((row) => [...row]);
    tempBoard[end.row][end.col] = tempBoard[start.row][start.col];
    tempBoard[start.row][start.col] = null;
    const newKingPosition =
      tempBoard[end.row][end.col]?.props.type === "king" ? end : kingPosition;
    return !isKingInCheck(tempBoard, newKingPosition);
  };

  const possibleMoves = [
    { row: kingRow - 1, col: kingCol },
    { row: kingRow + 1, col: kingCol },
    { row: kingRow, col: kingCol - 1 },
    { row: kingRow, col: kingCol + 1 },
    { row: kingRow - 1, col: kingCol - 1 },
    { row: kingRow - 1, col: kingCol + 1 },
    { row: kingRow + 1, col: kingCol - 1 },
    { row: kingRow + 1, col: kingCol + 1 },
  ];

  // Check if the king can move to any adjacent square
  for (const move of possibleMoves) {
    if (
      move.row >= 0 &&
      move.row < board.length &&
      move.col >= 0 &&
      move.col < board[0].length &&
      (!board[move.row][move.col] ||
        board[move.row][move.col].props.color !== kingColor)
    ) {
      if (isMoveValid({ row: kingRow, col: kingCol }, move)) {
        return false; // Not checkmate if a valid move is found
      }
    }
  }

  // Find the threatening pieces
  const threateningPieces = [];
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const piece = board[row][col];
      if (
        piece &&
        piece.props.color !== kingColor &&
        isThreateningPiece(board, { row, col }, kingPosition)
      ) {
        threateningPieces.push({ row, col });
      }
    }
  }

  // Check if any piece can block or capture the threatening pieces
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const piece = board[row][col];
      if (piece && piece.props.color === kingColor) {
        for (let threat of threateningPieces) {
          if (isBlockingMove(board, { row, col }, threat, kingPosition)) {
            return false; // Not checkmate if any piece can block or capture the threat
          }
        }
      }
    }
  }

  return true; // Checkmate if no valid moves are found
};

export const isThreateningPiece = (board, start, end) => {
  const piece = board[start.row][start.col];
  switch (piece.props.type) {
    case "rook":
      return validateRookMove(board, start, end, piece.props.color);
    case "bishop":
      return validateBishopMove(board, start, end);
    case "queen":
      return validateQueenMove(board, start, end);
    case "knight":
      return validateKnightMove(board, start, end);
    case "pawn":
      return validatePawnMove(board, start, end, piece.props.color);
    default:
      return false;
  }
};

const isBlockingMove = (board, start, end, kingPosition) => {
  const piece = board[start.row][start.col];

  if (!piece) return false; // Ensure there's a piece at the start position

  const tempBoard = board.map((row) => [...row]);

  // Ensure the move is valid for the piece type
  let isValidMove = false;
  switch (piece.props.type) {
    case "rook":
      isValidMove = validateRookMove(board, start, end, piece.props.color);
      break;
    case "bishop":
      isValidMove = validateBishopMove(board, start, end);
      break;
    case "queen":
      isValidMove = validateQueenMove(board, start, end);
      break;
    case "knight":
      isValidMove = validateKnightMove(board, start, end);
      break;
    case "pawn":
      isValidMove = validatePawnMove(board, start, end, piece.props.color);
      break;
    default:
      isValidMove = false;
  }

  if (!isValidMove) return false; // If the move is not valid, return false

  // Simulate the move on the temporary board
  tempBoard[end.row][end.col] = tempBoard[start.row][start.col];
  tempBoard[start.row][start.col] = null;

  // Check if the king is still in check after the move
  return !isKingInCheck(tempBoard, kingPosition);
};

export const validateCastle = (
  board,
  start,
  end,
  kingPosition,
  color,
  hasKingMoved
) => {
  const { row: startRow, col: startCol } = start;
  const { row: endRow, col: endCol } = end;

  // Ensure the function parameters are not undefined
  if (!kingPosition || !color) {
    return false;
  }

  // Cannot castle if the king has moved
  if (hasKingMoved) {
    return false;
  }

  if (startRow !== endRow || (endCol !== 2 && endCol !== 6)) {
    return false; // Castling only occurs on the same row and to column 2 or 6
  }

  if (isKingInCheck(board, kingPosition, color)) {
    return false; // Can't castle while in check
  }

  const step = startCol < endCol ? 1 : -1;

  // Check that all squares between the king and the target square are empty
  for (let col = startCol + step; col !== endCol; col += step) {
    if (board[startRow][col] !== null) {
      return false;
    }
  }

  // Check that the king does not pass through or land in check
  for (let col = startCol; col !== endCol; col += step) {
    const newKingPosition = { row: startRow, col };
    if (isKingInCheck(board, newKingPosition, color)) {
      return false;
    }
  }

  // Check if the rook is in the correct position for castling
  if (
    (endCol === 2 &&
      board[startRow][0]?.props?.type === "rook" &&
      board[startRow][0]?.props?.color === color) ||
    (endCol === 6 &&
      board[startRow][7]?.props?.type === "rook" &&
      board[startRow][7]?.props?.color === color)
  ) {
    // Determine new positions for castling
    if (endCol === 2) {
      return {
        kingNewPosition: [startRow, 2],
        rookNewPosition: [startRow, 3],
      };
    } else if (endCol === 6) {
      return {
        kingNewPosition: [startRow, 6],
        rookNewPosition: [startRow, 5],
      };
    }
  }

  return false;
};

export const checkForStalemate = (
  board,
  kingPosition,
  color,
  whiteKingPosition,
  blackKingPosition
) => {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const piece = board[row][col];
      if (piece && piece.props.color === color) {
        const possibleMoves = getPossibleMoves(
          board,
          { row, col },
          piece.props.type,
          color,
          whiteKingPosition,
          blackKingPosition
        );
        for (const move of possibleMoves) {
          if (
            !doesMoveExposeKing({ row, col }, move, board, color, kingPosition)
          ) {
            return false; // Not a stalemate if any valid move is found
          }
        }
      }
    }
  }
  return !isKingInCheck(board, kingPosition);
};
const getPossibleMoves = (
  board,
  start,
  type,
  color,
  whiteKingPosition,
  blackKingPosition
) => {
  const moves = [];
  const { row, col } = start;

  switch (type) {
    case "rook":
      for (let i = 0; i < board.length; i++) {
        if (
          i !== row &&
          validateRookMove(board, start, { row: i, col }, color)
        ) {
          moves.push({ row: i, col });
        }
        if (
          i !== col &&
          validateRookMove(board, start, { row, col: i }, color)
        ) {
          moves.push({ row, col: i });
        }
      }
      break;
    case "bishop":
      for (let i = 1; i < board.length; i++) {
        if (
          row + i < board.length &&
          col + i < board[row].length &&
          validateBishopMove(board, start, { row: row + i, col: col + i })
        ) {
          moves.push({ row: row + i, col: col + i });
        }
        if (
          row + i < board.length &&
          col - i >= 0 &&
          validateBishopMove(board, start, { row: row + i, col: col - i })
        ) {
          moves.push({ row: row + i, col: col - i });
        }
        if (
          row - i >= 0 &&
          col + i < board[row].length &&
          validateBishopMove(board, start, { row: row - i, col: col + i })
        ) {
          moves.push({ row: row - i, col: col + i });
        }
        if (
          row - i >= 0 &&
          col - i >= 0 &&
          validateBishopMove(board, start, { row: row - i, col: col - i })
        ) {
          moves.push({ row: row - i, col: col - i });
        }
      }
      break;
    case "queen":
      moves.push(...getPossibleMoves(board, start, "rook", color));
      moves.push(...getPossibleMoves(board, start, "bishop", color));
      break;
    case "knight":
      const knightMoves = [
        { row: row + 2, col: col + 1 },
        { row: row + 2, col: col - 1 },
        { row: row - 2, col: col + 1 },
        { row: row - 2, col: col - 1 },
        { row: row + 1, col: col + 2 },
        { row: row + 1, col: col - 2 },
        { row: row - 1, col: col + 2 },
        { row: row - 1, col: col - 2 },
      ];
      for (const move of knightMoves) {
        if (
          move.row >= 0 &&
          move.row < board.length &&
          move.col >= 0 &&
          move.col < board[row].length &&
          validateKnightMove(board, start, move)
        ) {
          moves.push(move);
        }
      }
      break;
    case "pawn":
      const direction = color === "white" ? -1 : 1;
      if (
        validatePawnMove(board, start, { row: row + direction, col }, color)
      ) {
        moves.push({ row: row + direction, col });
      }
      if (
        validatePawnMove(
          board,
          start,
          { row: row + direction, col: col + 1 },
          color
        )
      ) {
        moves.push({ row: row + direction, col: col + 1 });
      }
      if (
        validatePawnMove(
          board,
          start,
          { row: row + direction, col: col - 1 },
          color
        )
      ) {
        moves.push({ row: row + direction, col: col - 1 });
      }
      break;
    case "king":
      const kingMoves = [
        { row: row + 1, col },
        { row: row - 1, col },
        { row, col: col + 1 },
        { row, col: col - 1 },
        { row: row + 1, col: col + 1 },
        { row: row + 1, col: col - 1 },
        { row: row - 1, col: col + 1 },
        { row: row - 1, col: col - 1 },
      ];
      for (const move of kingMoves) {
        if (
          move.row >= 0 &&
          move.row < board.length &&
          move.col >= 0 &&
          move.col < board[row].length &&
          validateKingMove(
            board,
            start,
            move,
            whiteKingPosition,
            blackKingPosition
          )
        ) {
          moves.push(move);
        }
      }
      break;
    default:
      break;
  }

  return moves;
};

export const pawnPromotion = (end, color) => {
  const { row: endRow } = end;

  if (
    (color === "white" && endRow === 0) ||
    (color === "black" && endRow === 7)
  ) {
    return true;
  }
  return false;
};
