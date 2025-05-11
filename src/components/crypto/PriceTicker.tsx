import { useEffect, useRef, useState } from 'react';

interface PriceTickerProps {
  price: number;
  className?: string;
  showSmallDecimals?: boolean;
  onPriceChangeDirection?: (direction: 'up' | 'down' | null) => void;
}

export function PriceTicker({ price, className = '', showSmallDecimals = false, onPriceChangeDirection }: PriceTickerProps) {
  const previousPrice = useRef(price);

  useEffect(() => {
    if (price !== previousPrice.current) {
      const direction = price > previousPrice.current ? 'up' : 'down';
      if (onPriceChangeDirection) {
        onPriceChangeDirection(direction);
      }
      previousPrice.current = price;
    }
  }, [price, onPriceChangeDirection]);

  const formattedPrice = price.toLocaleString('en-US', {
    minimumFractionDigits: showSmallDecimals ? 4 : 2,
    maximumFractionDigits: showSmallDecimals ? 4 : 2
  });


  return (
    <span className={`transition-colors ${className}`}>
      ${formattedPrice}
    </span>
  );
}