import React from "react";

function NavigateMoveHistory({
  moveHistory,
  currentMoveIndex,
  onMoveIndexChange,
}) {
  return (
    <div className="move-history">
      <button onClick={() => onMoveIndexChange(currentMoveIndex - 1)}>
        Previous
      </button>
      <button onClick={() => onMoveIndexChange(currentMoveIndex + 1)}>
        Next
      </button>
    </div>
  );
}

export default NavigateMoveHistory;
