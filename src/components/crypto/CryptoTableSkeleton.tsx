export function CryptoTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-sm font-medium text-gray-500 border-b border-gray-200 dark:border-gray-800">
            <th scope="col" className="p-4 text-left font-medium">Rank</th>
            <th scope="col" className="p-4 text-left font-medium">Name</th>
            <th scope="col" className="p-4 text-left font-medium">Price</th>
            <th scope="col" className="p-4 text-right font-medium">Market Cap</th>
            <th scope="col" className="p-4 text-right font-medium">VWAP (24Hr)</th>
            <th scope="col" className="p-4 text-right font-medium">Supply</th>
            <th scope="col" className="p-4 text-right font-medium">Volume (24Hr)</th>
            <th scope="col" className="p-4 text-right font-medium">Change (24Hr)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {[...Array(10)].map((_, i) => (
            <tr key={i} className="animate-pulse">
              <td className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-8" />
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-16" />
                  </div>
                </div>
              </td>
              <td className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20" />
              </td>
              <td className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24 ml-auto" />
              </td>
              <td className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20 ml-auto" />
              </td>
              <td className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20 ml-auto" />
              </td>
              <td className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24 ml-auto" />
              </td>
              <td className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16 ml-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}