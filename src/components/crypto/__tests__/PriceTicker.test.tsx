import { render, screen } from '@testing-library/react';
import { PriceTicker } from '../PriceTicker';

describe('PriceTicker', () => {
  it('renders price with correct formatting', () => {
    render(<PriceTicker price={1234.5678} />);
    expect(screen.getByText('$1,234.57')).toBeInTheDocument();
  });

  it('renders price with more decimals when showSmallDecimals is true', () => {
    render(<PriceTicker price={1234.5678} showSmallDecimals={true} />);
    expect(screen.getByText('$1,234.5678')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<PriceTicker price={1234.56} className="test-class" />);
    const element = screen.getByText('$1,234.56');
    expect(element).toHaveClass('test-class');
    expect(element).toHaveClass('transition-colors');
  });

  it('calls onPriceChangeDirection when price changes', () => {
    const onPriceChangeDirection = jest.fn();
    const { rerender } = render(
      <PriceTicker 
        price={100} 
        onPriceChangeDirection={onPriceChangeDirection}
      />
    );

    // Price goes up
    rerender(
      <PriceTicker 
        price={150} 
        onPriceChangeDirection={onPriceChangeDirection}
      />
    );
    expect(onPriceChangeDirection).toHaveBeenCalledWith('up');

    // Price goes down
    rerender(
      <PriceTicker 
        price={50} 
        onPriceChangeDirection={onPriceChangeDirection}
      />
    );
    expect(onPriceChangeDirection).toHaveBeenCalledWith('down');
  });
});