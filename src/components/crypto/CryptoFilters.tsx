import { ChangeEvent, useState } from 'react';
import type { ReactElement } from 'react';

export type FilterField = 'priceUsd' | 'volumeUsd24Hr' | 'changePercent24Hr' | 'marketCapUsd';

interface FilterRange {
  min: string;
  max: string;
}

export interface FilterConfig {
  field: FilterField;
  range: FilterRange;
}

interface CryptoFiltersProps {
  onApplyFilter: (config: FilterConfig) => void;
  onReset: () => void;
}

export function CryptoFilters({ onApplyFilter, onReset }: CryptoFiltersProps): ReactElement {
  const [field, setField] = useState<FilterField>('priceUsd');
  const [range, setRange] = useState<FilterRange>({ min: '', max: '' });

  const formatNumberWithCommas = (value: string): string => {
    if (!value) return '';
    // Remove any non-digit characters except commas for length check
    const digitsOnly = value.replace(/[^\d]/g, '');
    if (digitsOnly.length > 15) return range.min; // Prevent input if exceeds 15 digits
    
    const number = Number(value.replace(/,/g, ''));
    if (isNaN(number)) return value;
    if (number >= 1000) {
      return number.toLocaleString('en-US');
    }
    return value;
  };

  const stripCommas = (value: string): string => {
    return value.replace(/,/g, '');
  };

  const handleMinChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = stripCommas(e.target.value);
    if (rawValue === '' || (!isNaN(Number(rawValue)) && Number(rawValue) >= 0)) {
      const formattedValue = formatNumberWithCommas(rawValue);
      setRange(prev => ({ ...prev, min: formattedValue }));
    }
  };

  const handleMaxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = stripCommas(e.target.value);
    if (rawValue === '' || (!isNaN(Number(rawValue)) && Number(rawValue) >= 0)) {
      const formattedValue = formatNumberWithCommas(rawValue);
      setRange(prev => ({ ...prev, max: formattedValue }));
    }
  };

  const handleReset = () => {
    setField('priceUsd');
    setRange({ min: '', max: '' });
    onReset();
  };

  const isRangeValid = (): boolean => {
    // If both values are empty, return false as there's nothing to filter
    if (range.min === '' && range.max === '') return false;
    
    // If only one value is provided, it's valid
    if (range.min === '' || range.max === '') return true;
    
    // If both values are provided, check if min <= max
    const min = Number(stripCommas(range.min));
    const max = Number(stripCommas(range.max));
    return min <= max;
  };

  const getInputClassName = (value: string): string => {
    const baseClass = "w-48 p-2 pl-6 bg-gray-900 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-white";
    if (value === '') return `${baseClass} border-gray-700`;
    if (!isRangeValid()) return `${baseClass} border-red-500 bg-red-900/50`;
    return `${baseClass} border-gray-700`;
  };

  const handleApply = () => {
    if (!isRangeValid()) return;
    onApplyFilter({
      field,
      range: {
        min: stripCommas(range.min),
        max: stripCommas(range.max)
      }
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-800 rounded-lg">
      <div className="flex items-center gap-4">
        <select
          value={field}
          onChange={(e) => setField(e.target.value as FilterField)}
          className="p-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
        >
          <option value="priceUsd">Price (USD)</option>
          <option value="volumeUsd24Hr">Volume 24h (USD)</option>
          <option value="changePercent24Hr">24h Change (%)</option>
          <option value="marketCapUsd">Market Cap (USD)</option>
        </select>
        
        <div className="flex items-center gap-2">
          <span className="text-gray-400">$</span>
          <input
            type="text"
            placeholder="Min"
            value={range.min}
            onChange={handleMinChange}
            className={getInputClassName(range.min)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-gray-400">$</span>
          <input
            type="text"
            placeholder="Max"
            value={range.max}
            onChange={handleMaxChange}
            className={getInputClassName(range.max)}
          />
        </div>

        <button
          onClick={handleApply}
          disabled={!isRangeValid()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Apply
        </button>
        
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
        >
          Reset
        </button>
      </div>
    </div>
  );
}