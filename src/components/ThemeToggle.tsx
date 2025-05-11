'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4">
      <div className="relative">
        {isOpen && (
          <div className="absolute bottom-12 right-0 flex flex-col gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setTheme('light');
                setIsOpen(false);
              }}
              className={`p-2 rounded-md flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                theme === 'light' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'
              }`}
              aria-label="Switch to light theme"
            >
              <Sun className="w-4 h-4" />
              <span className="text-sm">Light</span>
            </button>
            <button
              onClick={() => {
                setTheme('dark');
                setIsOpen(false);
              }}
              className={`p-2 rounded-md flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                theme === 'dark' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'
              }`}
              aria-label="Switch to dark theme"
            >
              <Moon className="w-4 h-4" />
              <span className="text-sm">Dark</span>
            </button>
            <button
              onClick={() => {
                setTheme('system');
                setIsOpen(false);
              }}
              className={`p-2 rounded-md flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                theme === 'system' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'
              }`}
              aria-label="Use system theme"
            >
              <Monitor className="w-4 h-4" />
              <span className="text-sm">System</span>
            </button>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
          aria-label="Toggle theme menu"
        >
          {theme === 'dark' ? (
            <Moon className="w-5 h-5 text-gray-800 dark:text-gray-200" />
          ) : theme === 'system' ? (
            <Monitor className="w-5 h-5 text-gray-800 dark:text-gray-200" />
          ) : (
            <Sun className="w-5 h-5 text-gray-800 dark:text-gray-200" />
          )}
        </button>
      </div>
    </div>
  );
}