'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import cn from 'classnames';
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