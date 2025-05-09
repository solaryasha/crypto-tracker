import { CryptoList } from "@/components/crypto/CryptoList";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Cryptocurrency Market</h1>
      <CryptoList />
    </main>
  );
}
