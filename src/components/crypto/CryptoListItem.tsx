'use client';

import { Asset } from '@/types/coincap';
import Link from 'next/link';
import { PriceTicker } from './PriceTicker';
import { formatNumber } from '@/utils/numberFormat';
import { useTheme } from 'next-themes';
import cn from 'classnames';
import { useRouter } from 'next/navigation';

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
  const { theme } = useTheme();
  const router = useRouter();

  const handleRowClick = () => {
    router.push(`/coin/${asset.id}`);
  };
  
  return (
    <tr className={cn("transition-colors cursor-pointer", {
      'hover:bg-gray-200': theme === 'light',
      'dark:hover:bg-gray-900': theme === 'dark',
    })}
    onClick={handleRowClick}
    >
      <td className="p-4 text-gray-500">{asset.rank}</td>

      <td className="p-4">
        <Link href={`/coin/${asset.id}`}>
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