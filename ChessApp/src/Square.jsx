import React from 'react';

function Square(props) {
  const { color, children, onClick } = props;
  return (
    <div className={color === 'black' ? 'black-square' : 'white-square'}  onClick={onClick}>
      {children}
    </div>
  );
}

export default Square;
