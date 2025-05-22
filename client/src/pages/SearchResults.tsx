import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchPodcasts, getAudioStream } from "@/api/podcast";
import PodcastCard from "@/components/PodcastCard";
import LoadingIndicator from "@/components/LoadingIndicator";
import ErrorMessage from "@/components/ErrorMessage";
import { Podcast, AudioStream } from "@/types/podcast";
import { extractVideoIdFromUrl } from "@/api/podcast";
import { useSearchStore } from "@/store/index";
import { useLocation } from "wouter";

interface SearchResultsProps {
  query: string;
  onPlayPodcast: (podcast: Podcast, stream: AudioStream) => void;
}

const SearchResults = ({ query, onPlayPodcast }: SearchResultsProps) => {
  const { setSearchQuery } = useSearchStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();
  
  // Update global search state
  useEffect(() => {
    setSearchQuery(query);
  }, [query, setSearchQuery]);
  
  // Search results query
  const searchQuery = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchPodcasts(query),
    enabled: !!query,
  });
  
  useEffect(() => {
    // Set error message if search query fails
    if (searchQuery.isError && query) {
      setError('Search failed. Please try again.');
    } else {
      setError(null);
    }
    
    // Set loading state
    setIsLoading(searchQuery.isLoading && !!query);
  }, [searchQuery.isError, searchQuery.isLoading, query]);
  
  const handlePlayPodcast = async (podcast: Podcast) => {
    try {
      setIsLoading(true);
      
      // Extract videoId
      const videoId = extractVideoIdFromUrl(podcast.url);
      if (!videoId) {
        throw new Error('Invalid podcast URL');
      }
      
      // Fetch stream with timeout to prevent long-running requests
      const streamPromise = getAudioStream(videoId);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 8000);
      });
      
      // Race the promises to handle timeouts
      const streamData = await Promise.race([streamPromise, timeoutPromise]) as any;
      
      if (streamData.audioStreams && streamData.audioStreams.length > 0) {
        onPlayPodcast(podcast, streamData.audioStreams[0]);
      } else {
        throw new Error('No audio streams available');
      }
    } catch (err) {
      setError('Failed to play podcast. Please try again.');
      console.error('Play podcast error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <main className="flex-grow pb-20 dark:bg-black">
      {/* Search Header with Back Button */}
      <div className="w-full py-6 shadow-md relative z-10 dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center mb-2 sm:mb-0">
              <button 
                onClick={() => {
                  // Clear search query and then navigate
                  setSearchQuery('');
                  // Use wouter navigation instead of direct URL change
                  navigate('/');
                }}
                className="mr-3 p-2 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 transition-colors"
                aria-label="Go back to home"
              >
                <span className="material-icons">arrow_back</span>
              </button>
              <h1 className="text-2xl font-bold text-foreground">
                Results for "<span className="text-orange-500 dark:text-orange-400">{query}</span>"
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-6">
        <div className="mb-8">
          {searchQuery.isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingIndicator text="Searching podcasts..." />
            </div>
          ) : (
            <>
              {searchQuery.data?.items && searchQuery.data.items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {searchQuery.data.items.map((podcast, index) => (
                    <PodcastCard 
                      key={`search-${podcast.url}-${index}`} 
                      podcast={podcast} 
                      onClick={() => handlePlayPodcast(podcast)}
                      priority={index < 8} // Prioritize first 8 results for better performance
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center bg-gray-50 dark:bg-zinc-900/50 rounded-lg p-10 shadow-sm">
                  <span className="material-icons text-5xl mb-3 text-gray-400 dark:text-gray-500">search_off</span>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">No results found for "{query}"</p>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">Try different keywords or check your spelling</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {isLoading && <LoadingIndicator />}
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
      
      {/* Additional padding at the bottom for the audio player */}
      <div className="h-28"></div>
    </main>
  );
};

export default SearchResults;