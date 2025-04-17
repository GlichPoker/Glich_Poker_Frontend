import React from 'react';
import Image from 'next/image';

interface CardProps {
  cardCode: string;
  width?: number; // Width in pixels
  height?: number; // Height in pixels
  className?: string;
}

const Card: React.FC<CardProps> = ({ 
  cardCode, 
  width = 80, 
  height = 120,
  className = '' 
}) => {
  // If no card code is provided, show card back
  const cardImageSrc = cardCode 
    ? `https://deckofcardsapi.com/static/img/${cardCode}.png` 
    : 'https://deckofcardsapi.com/static/img/back.png';

  return (
    <div className={`relative ${className}`}>
      <Image 
        src={cardImageSrc}
        alt={cardCode || 'Card back'}
        width={width}
        height={height}
        className="rounded-lg"
      />
    </div>
  );
};

export default Card;