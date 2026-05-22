import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...rest }) => {
  const baseClasses = 'bg-white rounded-xl border p-3';
  return (
    <div className={`${baseClasses} ${className}`} {...rest}>
      {children}
    </div>
  );
};

export default Card;
