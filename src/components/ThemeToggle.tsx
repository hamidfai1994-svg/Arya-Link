'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        aria-label="تغییر تم"
        className={`w-9 h-9 rounded-xl border border-border bg-card/60 flex items-center justify-center text-muted-foreground ${className}`}
      >
        <span className="w-4 h-4" />
      </button>
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="تغییر تم داشبورد"
      title={isDark ? 'تغییر به تم روشن' : 'تغییر به تم تاریک'}
      className={`w-9 h-9 rounded-xl border border-border bg-card hover:bg-accent/80 hover:text-accent-foreground flex items-center justify-center text-foreground transition-all duration-200 active:scale-95 shadow-sm ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 scale-100 duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-cyan-600 transition-transform rotate-0 scale-100 duration-300" />
      )}
    </button>
  );
}

export default ThemeToggle;
