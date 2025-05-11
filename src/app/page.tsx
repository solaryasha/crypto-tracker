import { CryptoList } from "@/components/crypto/CryptoList";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Cryptocurrency Market</h1>
      <Suspense fallback={<CryptoListFallback />}>
        <CryptoList />
      </Suspense>
    </main>
  );
}

function CryptoListFallback() {
  return (
    <div className="animate-pulse">
      <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
      <div className="space-y-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-800 rounded" />
        ))}
      </div>
    </div>
  );
}
