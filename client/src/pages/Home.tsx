import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFeaturedPodcasts, getNewestPodcasts, searchPodcasts, getAudioStream } from "@/api/podcast";
import PodcastCard from "@/components/PodcastCard";
import LoadingIndicator from "@/components/LoadingIndicator";
import ErrorMessage from "@/components/ErrorMessage";
import FeaturedCreators from "@/components/FeaturedCreators";
import { useSearchStore, useAuthStore } from "@/store/index";
import { Podcast, AudioStream } from "@/types/podcast";
import { extractVideoIdFromUrl } from "@/api/podcast";
import { cn } from "@/lib/utils";

interface HomeProps {
  onPlayPodcast: (podcast: Podcast, stream: AudioStream) => void;
}

// Helper function to get greeting based on time of day
const getGreeting = (): string => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return 'Good morning';
  } else if (hour >= 12 && hour < 18) {
    return 'Good afternoon';
  } else if (hour >= 18 && hour < 22) {
    return 'Good evening';
  } else {
    return 'Good night';
  }
};

const Home = ({ onPlayPodcast }: HomeProps) => {
  const { searchQuery } = useSearchStore();
  const { user, isAuthenticated } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [greeting, setGreeting] = useState(getGreeting());
  
  // Update greeting every minute
  useEffect(() => {
    const intervalId = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000); // 60000 ms = 1 minute
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Featured podcasts query - optimized to reduce unnecessary fetches
  const featuredQuery = useQuery({
    queryKey: ['featured'],
    queryFn: getFeaturedPodcasts,
    staleTime: 30 * 60 * 1000, // 30 minutes - only refetch after 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour - keep in cache for 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });
  
  // Newest podcasts query - optimized to reduce unnecessary fetches
  const newestQuery = useQuery({
    queryKey: ['newest'],
    queryFn: getNewestPodcasts,
    staleTime: 15 * 60 * 1000, // 15 minutes - only refetch after 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });
  
  // Process podcasts to eliminate duplicates between featured and newest
  // Using a more performant implementation with useMemo
  const processedFeatured = useMemo(() => {
    // Return early for better initial rendering performance
    if (!featuredQuery.data?.items) return [];
    if (!newestQuery.data?.items) return featuredQuery.data.items;
    
    // Get URLs from newest podcasts to filter out duplicates
    // Create a Set for O(1) lookup performance
    const newestUrls = new Set(newestQuery.data.items.map(podcast => podcast.url));
    
    // Create a new array only with the non-duplicate items
    // This is faster than creating a new filtered array for large datasets
    // Using a pre-allocated array when we know the max size for performance
    const result = [];
    const featuredItems = featuredQuery.data.items;
    const featuredLength = featuredItems.length;
    
    for (let i = 0; i < featuredLength; i++) {
      if (!newestUrls.has(featuredItems[i].url)) {
        result.push(featuredItems[i]);
      }
    }
    
    return result;
  }, [featuredQuery.data, newestQuery.data]);
  
  // Search results query - enabled only when there is a search query
  const searchQuery1 = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => searchPodcasts(searchQuery),
    enabled: !!searchQuery,
  });
  
  useEffect(() => {
    // Set error message if any query fails
    if (featuredQuery.isError) {
      setError('Failed to load featured podcasts. Please try again.');
    } else if (newestQuery.isError) {
      setError('Failed to load newest podcasts. Please try again.');
    } else if (searchQuery1.isError && searchQuery) {
      setError('Search failed. Please try again.');
    } else {
      setError(null);
    }
    
    // Set loading state
    setIsLoading(
      featuredQuery.isLoading ||
      newestQuery.isLoading ||
      (searchQuery1.isLoading && !!searchQuery)
    );
  }, [featuredQuery.isError, featuredQuery.isLoading, newestQuery.isError, newestQuery.isLoading, searchQuery1.isError, searchQuery1.isLoading, searchQuery]);
  
  const handlePlayPodcast = async (podcast: Podcast) => {
    try {
      setIsLoading(true);
      
      // Extract videoId faster with optimized function
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
    <main className="flex-grow pb-20 bg-background text-foreground">
      
      {/* Hero Section - Using newest podcasts instead of featured */}
      {!searchQuery && !newestQuery.isLoading && newestQuery.data?.items && newestQuery.data.items.length > 0 && (
        <div className="relative w-full h-80 sm:h-[420px] md:h-[480px] mb-12 overflow-hidden rounded-2xl mx-auto max-w-[1440px]">
          {/* Hero Background with enhanced blur effect and gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/80 via-zinc-900/70 to-background dark:from-black/80 dark:via-black/70 z-10"></div>
          
          <div
            className="absolute inset-0 bg-cover bg-center animate-subtle-pulse"
            style={{
              backgroundImage: `url(${newestQuery.data.items[0].thumbnail})`,
              filter: 'blur(12px) saturate(120%)',
              transform: 'scale(1.1)'
            }}
          ></div>
          
          {/* Glass Overlay */}
          <div className="absolute inset-0 backdrop-blur-sm bg-zinc-900/10 dark:bg-black/10 z-[11]"></div>
          
          {/* Newest Podcast in Hero */}
          <div className="container mx-auto h-full flex flex-col md:flex-row items-center justify-center md:justify-between px-4 relative z-20">
            <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left mt-8 md:mt-0">
              <div className="flex items-center bg-orange-500/20 px-4 py-2 rounded-full mb-4 backdrop-blur-md border border-orange-500/30">
                <span className="material-icons text-orange-500 dark:text-orange-400 mr-2 animate-pulse">auto_awesome</span>
                <span className="text-orange-700 dark:text-orange-100 text-sm font-medium">{greeting}, {isAuthenticated && user?.name ? user.name : 'Guest'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 drop-shadow-md">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-orange-500">Latest Podcast Release</span>
              </h1>
              <p className="text-lg text-gray-700 dark:text-gray-200 mb-6 max-w-md drop-shadow-md">
                {newestQuery.data.items[0].title}
              </p>
              <button
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full text-white font-medium shadow-lg hover:shadow-orange-500/25 hover:scale-105 active:scale-95 transition-all duration-300"
                onClick={() => newestQuery.data && handlePlayPodcast(newestQuery.data.items[0])}
              >
                <span className="flex items-center">
                  <span className="material-icons mr-2">play_circle</span>
                  Play Now
                </span>
              </button>
            </div>
            
            <div className="hidden md:block w-1/3 p-4">
              <div className="relative rounded-xl overflow-hidden shadow-2xl transform hover:translate-y-[-5px] transition-all duration-500 group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-300"></div>
                <img
                  src={newestQuery.data.items[0].thumbnail}
                  alt="Latest Podcast"
                  className="w-full aspect-video object-cover transform scale-100 group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white font-bold text-lg line-clamp-2">{newestQuery.data.items[0].title}</h3>
                  <div className="flex items-center mt-1">
                    <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center mr-2">
                      <span className="material-icons text-white text-xs">person</span>
                    </div>
                    <p className="text-gray-200 text-sm">{newestQuery.data.items[0].uploaderName}</p>
                    {newestQuery.data.items[0].uploaderVerified && (
                      <span className="material-icons text-orange-400 text-sm ml-1">verified</span>
                    )}
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    className="w-16 h-16 rounded-full bg-orange-500/90 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/20 backdrop-blur-sm hover:bg-orange-600"
                    onClick={() => newestQuery.data && handlePlayPodcast(newestQuery.data.items[0])}
                  >
                    <span className="material-icons text-3xl ml-1">play_arrow</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4">

        {/* Search Results Section (only shown when there's a search query) */}
        {searchQuery && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center">
              <span className="material-icons mr-2 text-orange-500">search</span>
              Results for "<span className="text-orange-500">{searchQuery}</span>"
            </h2>
            
            {searchQuery1.isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingIndicator text="Finding podcasts..." />
              </div>
            ) : (
              <>
                {searchQuery1.data?.items && searchQuery1.data.items.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {searchQuery1.data.items.map((podcast, index) => (
                      <PodcastCard 
                        key={`search-${podcast.url}-${index}`} 
                        podcast={podcast} 
                        onClick={() => handlePlayPodcast(podcast)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center bg-gray-100 dark:bg-zinc-900 rounded-lg p-10 shadow-sm border border-gray-200 dark:border-zinc-800">
                    <span className="material-icons text-5xl mb-3 text-gray-500 dark:text-gray-400">search_off</span>
                    <p className="text-gray-700 dark:text-gray-300 text-lg">No results found for "{searchQuery}"</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Try different keywords or check your spelling</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        
        {/* Featured Creators Section */}
        {!searchQuery && (
          <div className="mb-10">
            <FeaturedCreators />
          </div>
        )}
        
        {/* Newest Podcasts Section - Enhanced Scrollable */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
              <span className="material-icons mr-2 text-orange-500">whatshot</span>
              Newest Podcasts
            </h2>
            <div className="flex items-center text-sm">
              <span className="hidden sm:inline text-gray-500 dark:text-gray-300 mr-2">Scroll for more</span>
              <span className="material-icons text-gray-500 dark:text-gray-300 animate-bounce">arrow_forward</span>
            </div>
          </div>
          
          {newestQuery.isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingIndicator text="Loading newest..." />
            </div>
          ) : (
            <>
              {newestQuery.data?.items && newestQuery.data.items.length > 0 ? (
                <div className="relative">
                  <div className="overflow-x-auto pb-6 hide-scrollbar hardware-accelerated rounded-lg" 
                       style={{ 
                         WebkitOverflowScrolling: 'touch',
                         scrollBehavior: 'smooth',
                         msOverflowStyle: 'none',
                         willChange: 'scroll-position'
                       }}>
                    <div className="flex space-x-6 px-3 py-2 hardware-accelerated" 
                         style={{ 
                           minWidth: 'min-content'
                         }}>
                      {newestQuery.data.items.map((podcast, index) => (
                        <div className="w-72 sm:w-72 md:w-[340px] lg:w-[380px] xl:w-96 flex-shrink-0 hardware-accelerated" 
                             key={`newest-${podcast.url}-${index}`}
                             style={{ 
                               willChange: 'transform'
                             }}>
                          <PodcastCard 
                            podcast={podcast} 
                            onClick={() => handlePlayPodcast(podcast)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Fade gradients on edges - YouTube style */}
                  <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-20 pointer-events-none hardware-accelerated",
                    "bg-gradient-to-r from-background to-transparent dark:from-background/95"
                  )}
                  style={{ willChange: 'opacity' }}></div>
                  <div className={cn(
                    "absolute right-0 top-0 bottom-0 w-20 pointer-events-none hardware-accelerated",
                    "bg-gradient-to-l from-background to-transparent dark:from-background/95"
                  )}
                  style={{ willChange: 'opacity' }}></div>
                </div>
              ) : (
                <div className="text-center bg-gray-100 dark:bg-zinc-900 rounded-lg p-10 shadow-sm border border-gray-200 dark:border-zinc-800">
                  <span className="material-icons text-5xl mb-3 text-gray-500 dark:text-gray-400">podcasts</span>
                  <p className="text-gray-700 dark:text-gray-300">No new podcasts available</p>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Featured Podcasts Section - YouTube-Inspired Grid */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
              <span className="material-icons mr-2 text-orange-500">star</span>
              Featured Podcasts
            </h2>
            <button className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 flex items-center">
              See all <span className="material-icons ml-1 text-base">chevron_right</span>
            </button>
          </div>
          
          {featuredQuery.isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingIndicator text="Loading featured..." />
            </div>
          ) : (
            <>
              {processedFeatured.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {processedFeatured.map((podcast, index) => (
                    <PodcastCard 
                      key={`featured-${podcast.url}-${index}`} 
                      podcast={podcast} 
                      onClick={() => handlePlayPodcast(podcast)}
                      priority={index < 4} // Only prioritize loading for first 4 items
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center bg-gray-100 dark:bg-zinc-900 rounded-lg p-10 shadow-sm border border-gray-200 dark:border-zinc-800">
                  <span className="material-icons text-5xl mb-3 text-gray-500 dark:text-gray-400">podcasts</span>
                  <p className="text-gray-700 dark:text-gray-300">No additional featured podcasts available</p>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Global Error and Loading Indicators */}
        {isLoading && (
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50">
            <LoadingIndicator fullScreen={true} />
          </div>
        )}
        
        {error && (
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
            <ErrorMessage message={error} onDismiss={() => setError(null)} />
          </div>
        )}
        
        {/* Additional padding at the bottom for the audio player */}
        <div className="h-28"></div>
      </div>
    </main>
  );
};

export default Home;
