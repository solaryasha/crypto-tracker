'use client';

import { BackButton } from '@/components/BackButton';

export default function CoinLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <div className="relative min-h-screen">
      <BackButton />
      {children}
    </div>
  );
}