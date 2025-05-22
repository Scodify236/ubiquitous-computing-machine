import { useState, useCallback, memo } from "react";
import { useLocation } from "wouter";
import SearchBar from "./SearchBar";
import UserProfile from "./UserProfile";
import { useSearchStore, useAuthStore } from "@/store/index";
import { useShareStore } from "@/lib/useShare";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  isAuthPage?: boolean;
}

const Header = memo(({ isAuthPage }: HeaderProps) => {
  const [location, setLocation] = useLocation();
  const { setSearchQuery } = useSearchStore();
  const { isAuthenticated } = useAuthStore();
  const { shareApp } = useShareStore();
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);
  const isMobile = useIsMobile();
  
  // Determine if we're on the home page
  const isHomePage = location === '/';
  
  // Memoized search handler for better performance
  const handleSearch = useCallback((query: string) => {
    if (query.trim()) {
      setSearchQuery(query);
      setLocation(`/search/${encodeURIComponent(query)}`);
      
      // Hide mobile search after searching
      if (isMobile) {
        setMobileSearchVisible(false);
      }
    }
  }, [setSearchQuery, setLocation, isMobile]);
  
  // Toggle mobile search visibility with animation
  const toggleMobileSearch = useCallback(() => {
    setMobileSearchVisible(prev => !prev);
  }, []);
  
  // Navigate to home and clear search
  const goToHome = useCallback(() => {
    setSearchQuery(''); // Clear search when going to home
    setLocation('/');
  }, [setSearchQuery, setLocation]);
  
  // Don't render the header at all on auth page if not authenticated
  if (isAuthPage && !isAuthenticated) {
    return null;
  }

  return (
    <header className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md sticky top-0 z-30 shadow-sm border-b border-gray-100 dark:border-zinc-800/30 transition-colors duration-300">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo with subtle hover effects */}
        <div className="flex items-center flex-shrink-0">
          <div 
            className="flex items-center cursor-pointer group mr-2" 
            onClick={goToHome}
          >
            <span className="material-icons text-orange-500 mr-1.5 group-hover:text-orange-600 transition-colors text-2xl group-hover:animate-pulse">music_note</span>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-gray-900 dark:text-white transition-colors duration-300">VE</span>
              <span className="text-orange-500 group-hover:text-orange-600 transition-colors">LIN</span>
            </h1>
          </div>
        </div>
        
        {/* Desktop Search Bar with optimized rendering */}
        {!isAuthPage && (
          <div className="w-full max-w-xl mx-4 hidden md:block flex-1">
            <SearchBar onSearch={handleSearch} />
          </div>
        )}
        
        {/* User controls */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          {/* Create Podcast button */}
          {!isAuthPage && isAuthenticated && (
            <button 
              className="flex items-center justify-center px-2 py-1 text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 transition-colors group rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
              aria-label="Create podcast"
              onClick={() => setLocation('/create')}
            >
              <span className="material-icons mr-1 text-lg">add_circle</span>
              <span className="hidden sm:inline text-sm font-medium">Create</span>
            </button>
          )}
          
          {/* User Profile or Sign In */}
          {isAuthenticated ? (
            <UserProfile 
              showThemeToggle={true}
              showShareButton={true}
              handleShareApp={shareApp}
            />
          ) : (
            !isAuthPage && (
              <button 
                className="flex items-center px-4 py-2 text-orange-500 border border-orange-500 rounded-full hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all"
                onClick={() => setLocation('/auth')}
              >
                <span className="material-icons text-sm mr-1 align-text-bottom">account_circle</span>
                <span>Sign In</span>
              </button>
            )
          )}
        
          {/* Mobile Search Toggle */}
          {!isAuthPage && (
            <button 
              className="md:hidden w-10 h-10 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 transition-all rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
              onClick={toggleMobileSearch}
              aria-label="Toggle search"
            >
              <span className="material-icons">{mobileSearchVisible ? 'close' : 'search'}</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Mobile Search Bar */}
      {!isAuthPage && (
        <div 
          className={`md:hidden w-full px-4 py-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-t border-gray-100 dark:border-zinc-800/50 transition-all duration-300 ease-in-out shadow-inner ${
            mobileSearchVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none absolute'
          }`}
        >
          <SearchBar onSearch={handleSearch} autoFocus={mobileSearchVisible} />
        </div>
      )}
    </header>
  );
});

export default Header;
