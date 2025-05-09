'use client';

import { Asset } from '@/types/coincap';
import Link from 'next/link';

interface CryptoListItemProps {
  asset: Asset;
}

export function CryptoListItem({ asset }: CryptoListItemProps) {
  const price = parseFloat(asset.priceUsd);
  const change = parseFloat(asset.changePercent24Hr);
  const marketCap = parseFloat(asset.marketCapUsd);

  return (
    <Link 
      href={`/coin/${asset.id}`}
      className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors border-b border-gray-200 dark:border-gray-800"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center">
            {asset.symbol.slice(0, 1)}
          </div>
          <div>
            <h3 className="font-medium">{asset.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{asset.symbol}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono font-medium">
            ${price < 1 ? price.toFixed(4) : price.toFixed(2)}
          </p>
          <p className={`text-sm ${change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
          </p>
        </div>
      </div>
      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Market Cap: ${(marketCap / 1e9).toFixed(2)}B
      </div>
    </Link>
  );
}