import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/lib/store';

export function ThemeToggle() {
  const theme = useChatStore((state) => state.theme);
  const toggleTheme = useChatStore((state) => state.toggleTheme);

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={toggleTheme}
      data-testid="button-theme-toggle"
      className="hover-elevate active-elevate-2"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </Button>
  );
}
