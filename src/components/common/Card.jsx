import React from 'react';

const Card = ({
  children,
  className = '',
  hover = false,
  onClick = null,
  ...props
}) => {
  const baseStyles = 'bg-white rounded-xl shadow-md p-6 transition-all duration-300';
  const hoverStyles = hover ? 'hover:shadow-lg hover:scale-105 cursor-pointer' : '';

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick(e) : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
