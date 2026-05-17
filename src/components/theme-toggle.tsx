import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type Theme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

const THEME_ORDER: Theme[] = ['light', 'dark', 'system'];

const LABELS: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

const ICONS: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

interface ThemeToggleProps {
  className?: string;
  /**
   * "ghost" matches the app shell (icon-only on a transparent surface).
   * "outline" is for marketing surfaces where the toggle needs a chip.
   */
  variant?: 'ghost' | 'outline';
}

/**
 * Sun → Moon → Monitor cycle. Single-button affordance: each click advances
 * to the next mode. The active mode's icon is shown, and the next mode's
 * label is announced to assistive tech via `aria-label`.
 */
export function ThemeToggle({ className, variant = 'ghost' }: ThemeToggleProps) {
  const { theme, cycleTheme } = useTheme();
  const Icon = ICONS[theme];
  const nextIndex = (THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length;
  const nextTheme = THEME_ORDER[nextIndex];

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={`Theme: ${LABELS[theme]}. Switch to ${LABELS[nextTheme]}.`}
      title={`Theme: ${LABELS[theme]}`}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-md text-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        variant === 'ghost'
          ? 'text-foreground/70 hover:bg-accent hover:text-foreground'
          : 'border border-landing-grid text-landing-dark hover:bg-landing-grid/40',
        className,
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
