import { useEffect, useRef, useState } from 'react';

interface PriceTickerProps {
  price: number;
  className?: string;
  showSmallDecimals?: boolean;
}

export function PriceTicker({ price, className = '', showSmallDecimals = false }: PriceTickerProps) {
  const [priceChange, setPriceChange] = useState<'up' | 'down' | null>(null);
  const previousPrice = useRef(price);

  useEffect(() => {
    if (price !== previousPrice.current) {
      console.log('Price changed:', price);
      setPriceChange(price > previousPrice.current ? 'up' : 'down');
      previousPrice.current = price;

      // Reset the animation after it plays
      const timer = setTimeout(() => {
        setPriceChange(null);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [price]);

  const formattedPrice = showSmallDecimals || price < 1 
    ? price.toFixed(4) 
    : price.toFixed(2);

  const animationClass = priceChange === 'up' 
    ? 'text-green-600 dark:text-green-400 animate-price-up' 
    : priceChange === 'down' 
      ? 'text-red-600 dark:text-red-400 animate-price-down' 
      : '';

  return (
    <span className={`transition-colors ${animationClass} ${className}`}>
      ${formattedPrice}
    </span>
  );
}