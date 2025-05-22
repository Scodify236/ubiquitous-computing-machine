import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useSearchStore } from "@/store/index";

interface SearchBarProps {
  onSearch: (query: string) => void;
  autoFocus?: boolean;
  placeholder?: string;
}

const SearchBar = memo(({ 
  onSearch, 
  autoFocus = false,
  placeholder = "Search podcasts, channels, or topics..." 
}: SearchBarProps) => {
  const { searchQuery } = useSearchStore();
  const [query, setQuery] = useState(searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Update local query state when global search query changes
  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);
  
  // Handle autofocus when the prop changes
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);
  
  // Optimized form submission handler
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  }, [query, onSearch]);
  
  // Handler for input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);
  
  // Handler for clearing the search input
  const clearSearch = useCallback(() => {
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  // Handler for Enter key press on input field
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      onSearch(query.trim());
    }
  }, [query, onSearch]);
  
  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="flex w-full h-10">
          {/* Search field with modern design and improved focus states */}
          <div className="grow flex items-center h-full group border border-gray-200 dark:border-zinc-700/80 rounded-l-full overflow-hidden hover:border-gray-300 dark:hover:border-zinc-600 focus-within:border-orange-500 dark:focus-within:border-orange-500 focus-within:shadow-[0_0_0_2px_rgba(249,115,22,0.2)] dark:focus-within:shadow-[0_0_0_2px_rgba(249,115,22,0.15)] transition-all duration-200 bg-gray-50/90 dark:bg-zinc-800/50 backdrop-blur-sm">
            {/* Search icon with animation */}
            <div className="pl-4 text-gray-400 group-focus-within:text-orange-500 transition-colors">
              <span className="material-icons text-[18px]">search</span>
            </div>
            
            <input 
              ref={inputRef}
              type="text" 
              className="h-full w-full py-1 px-3 bg-transparent border-0 focus:outline-none text-gray-800 dark:text-gray-200 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder={placeholder}
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              spellCheck="false"
              autoCapitalize="off"
            />
            
            {/* Clear button with improved animation */}
            {query && (
              <button 
                type="button"
                className="w-8 h-8 flex items-center justify-center mr-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-full transition-all"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <span className="material-icons text-[18px]">close</span>
              </button>
            )}
          </div>
          
          {/* Submit button with improved feedback */}
          <button 
            type="submit"
            className="h-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 px-4 rounded-r-full border border-l-0 border-orange-500 hover:border-orange-600 text-white transition-all duration-200 shadow-sm flex items-center justify-center"
            aria-label="Search"
          >
            <span className="material-icons text-[18px]">search</span>
          </button>
        </div>
      </form>
    </div>
  );
});

export default SearchBar;
