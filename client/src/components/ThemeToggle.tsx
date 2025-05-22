import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useThemeStore, getEffectiveTheme } from '@/store/themeStore';

export default function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  // Apply theme class to document
  useEffect(() => {
    const effectiveTheme = getEffectiveTheme(theme);
    
    // Remove both classes first
    document.documentElement.classList.remove('light', 'dark');
    
    // Add the appropriate class
    document.documentElement.classList.add(effectiveTheme);
    
    // If the theme is 'system', we need to listen for changes in system preference
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(
          mediaQuery.matches ? 'dark' : 'light'
        );
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);
  
  // Get icon based on current effective theme
  const getThemeIcon = () => {
    const effectiveTheme = getEffectiveTheme(theme);
    if (effectiveTheme === 'dark') return 'dark_mode';
    return 'light_mode';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-full"
        >
          <span className="material-icons">{getThemeIcon()}</span>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')} className="flex items-center">
          <span className="material-icons mr-2 text-yellow-500">light_mode</span>
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className="flex items-center">
          <span className="material-icons mr-2 text-orange-500">dark_mode</span>
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')} className="flex items-center">
          <span className="material-icons mr-2">computer</span>
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}