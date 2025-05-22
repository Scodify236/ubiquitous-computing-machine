import { useAuthStore } from "@/store/index";
import { useThemeStore } from "@/store/themeStore";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "wouter";
import { useShare } from "@/lib/useShare";

interface UserProfileProps {
  showThemeToggle?: boolean;
  showShareButton?: boolean;
  handleShareApp?: () => void;
}

const UserProfile = ({ showThemeToggle = false, showShareButton = false, handleShareApp }: UserProfileProps) => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const isMobile = useIsMobile();
  const [location, navigate] = useLocation();
  const { shareApp } = useShare();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  // Get initials from name (if available) or email for avatar fallback
  const initials = user.name 
    ? user.name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : user.email
        .split('@')[0]
        .split('.')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="p-0 h-8 w-8 rounded-full" aria-label="User menu">
          <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700">
            <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} alt={user.email} />
            <AvatarFallback className="bg-orange-500 text-white font-semibold text-xs">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-md shadow-lg w-64">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
          <Avatar className="h-12 w-12 mr-3 border-2 border-orange-100 dark:border-orange-900/30">
            <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} alt={user.email} />
            <AvatarFallback className="bg-orange-500 text-white font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-base">{user.name || user.email.split('@')[0]}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{user.email}</span>
          </div>
        </div>
        
        {/* Navigation items */}
        <DropdownMenuItem 
          className="flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 focus:bg-gray-100 focus:dark:bg-zinc-700 px-4 py-2.5"
          onClick={handleGoHome}
        >
          <span className="material-icons text-sm mr-3">home</span>
          Home
        </DropdownMenuItem>
        
        {/* Always show Share App option with our new share system */}
        <DropdownMenuItem 
          className="flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 focus:bg-gray-100 focus:dark:bg-zinc-700 px-4 py-2.5"
          onClick={() => shareApp()}
        >
          <span className="material-icons text-sm mr-3">share</span>
          Share App
        </DropdownMenuItem>
        
        {/* Check for Updates */}
        <DropdownMenuItem 
          className="flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 focus:bg-gray-100 focus:dark:bg-zinc-700 px-4 py-2.5"
          onClick={() => {
            // Clear caches to force update
            if ('caches' in window) {
              caches.keys().then(cacheNames => {
                cacheNames.forEach(cacheName => {
                  caches.delete(cacheName);
                });
                toast({
                  title: "Cache cleared",
                  description: "App cache has been cleared. Reloading for updates...",
                });
                // Wait a moment before reloading
                setTimeout(() => {
                  window.location.reload();
                }, 1500);
              });
            } else {
              // Fallback for browsers that don't support Cache API
              toast({
                title: "Update check started",
                description: "Checking for updates...",
              });
              setTimeout(() => {
                window.location.href = window.location.href.split('?')[0]; // Reload without query params
              }, 1500);
            }
          }}
        >
          <span className="material-icons text-sm mr-3">system_update</span>
          Check for Updates
        </DropdownMenuItem>
        
        {/* Theme toggle section for mobile */}
        {showThemeToggle && (
          <>
            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
            <div className="px-4 py-2">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Appearance</p>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <button 
                  className={`flex flex-col items-center justify-center p-2 rounded ${
                    theme === 'light' 
                      ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 border-2 border-orange-200 dark:border-orange-800' 
                      : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                  onClick={() => setTheme('light')}
                >
                  <span className="material-icons text-sm mb-1">light_mode</span>
                  <span className="text-xs">Light</span>
                </button>
                
                <button 
                  className={`flex flex-col items-center justify-center p-2 rounded ${
                    theme === 'dark' 
                      ? 'bg-orange-900/10 text-orange-500 border-2 border-orange-200 dark:border-orange-800 dark:bg-orange-900/30 dark:text-orange-400' 
                      : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                  onClick={() => setTheme('dark')}
                >
                  <span className="material-icons text-sm mb-1">dark_mode</span>
                  <span className="text-xs">Dark</span>
                </button>
                
                <button 
                  className={`flex flex-col items-center justify-center p-2 rounded ${
                    theme === 'system' 
                      ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600' 
                      : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                  onClick={() => setTheme('system')}
                >
                  <span className="material-icons text-sm mb-1">computer</span>
                  <span className="text-xs">System</span>
                </button>
              </div>
            </div>
          </>
        )}
        
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
        <DropdownMenuItem 
          className="flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 focus:bg-gray-100 focus:dark:bg-zinc-700 px-4 py-2.5"
          onClick={handleLogout}
        >
          <span className="material-icons text-sm mr-3">logout</span>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;