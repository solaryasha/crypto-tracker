'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import cn from 'classnames';

interface BackButtonProps {
  /**
   * The path to navigate to when clicked
   * @default "/"
   */
  href?: string;
}

export function BackButton({ href = '/' }: BackButtonProps) {
  const { theme } = useTheme();

  return (
    <Link
    href={href}
    className={cn("p-2 rounded-lg hover:bg-gray-100 transition-colors fixed top-4 left-4 z-50", {
      "dark:hover:bg-gray-700": theme === 'dark'
    })}
    aria-label="Back to home"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
      />
    </svg>
  </Link>
  );
}