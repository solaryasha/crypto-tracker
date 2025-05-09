'use client';

import { Asset } from '@/types/coincap';
import Link from 'next/link';
import { PriceTicker } from './PriceTicker';
import { formatNumber } from '@/utils/numberFormat';

interface CryptoListItemProps {
  asset: Asset;
}

export function CryptoListItem({ asset }: CryptoListItemProps) {
  const price = parseFloat(asset.priceUsd);
  const change = parseFloat(asset.changePercent24Hr);
  const marketCap = parseFloat(asset.marketCapUsd);
  const vwap = parseFloat(asset.vwap24Hr);
  const supply = parseFloat(asset.supply);
  const volume = parseFloat(asset.volumeUsd24Hr);
  
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
      <td className="p-4 text-gray-500">{asset.rank}</td>

      <td className="p-4">
        <Link href={`/coin/${asset.id}`} className="hover:text-blue-500">
          <div>
            <div className="font-medium">{asset.name}</div>
            <div className="text-sm text-gray-500">{asset.symbol}</div>
          </div>
        </Link>
      </td>

      <td className="p-4">
        <PriceTicker price={price} showSmallDecimals={price < 1} />
      </td>

      <td className="p-4 font-mono text-right">
        ${formatNumber(marketCap)}
      </td>

      <td className="p-4 font-mono text-right">
        ${formatNumber(vwap)}
      </td>

      <td className="p-4 font-mono text-right">
        {formatNumber(supply)}
      </td>

      <td className="p-4 font-mono text-right">
        ${formatNumber(volume)}
      </td>

      <td className={`p-4 text-right ${change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {change >= 0 ? '+' : ''}{change.toFixed(2)}%
      </td>
    </tr>
  );
}