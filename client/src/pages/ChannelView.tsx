import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getChannelInfo, getMoreChannelEpisodes, getAudioStream } from "@/api/podcast";
import PodcastCard from "@/components/PodcastCard";
import LoadingIndicator from "@/components/LoadingIndicator";
import ErrorMessage from "@/components/ErrorMessage";
import { Podcast, AudioStream, ChannelResponse } from "@/types/podcast";
import { extractVideoIdFromUrl } from "@/api/podcast";

interface ChannelViewProps {
  id: string;
  onPlayPodcast: (podcast: Podcast, stream: AudioStream) => void;
}

const ChannelView = ({ id, onPlayPodcast }: ChannelViewProps) => {
  const [, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [allEpisodes, setAllEpisodes] = useState<Podcast[]>([]);
  
  // Get channel information directly from the API
  const { data: channelData, isLoading: isChannelLoading, isError } = useQuery<ChannelResponse>({
    queryKey: [`channel-${id}`],
    queryFn: async () => {
      try {
        const response = await fetch(`https://backendmix.vercel.app/channel/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch channel data: ${response.statusText}`);
        }
        const data = await response.json();
        
        // Initialize allEpisodes when we get initial data
        if (data.relatedStreams && data.relatedStreams.length > 0) {
          setAllEpisodes(data.relatedStreams);
        }
        
        // Set next page token if available
        if (data.nextpage) {
          setNextPageToken(data.nextpage);
        }
        
        return data;
      } catch (error) {
        console.error('Error fetching channel data:', error);
        throw error;
      }
    }
  });
  
  const handleLoadMore = async () => {
    if (!nextPageToken) return;
    
    try {
      setIsLoading(true);
      
      // Improved error handling and fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      try {
        // Use the external API directly with proper error handling
        const nextPageUrl = `https://backendmix.vercel.app/nextpage/channel/${id}?nextpage=${encodeURIComponent(nextPageToken)}`;
        
        console.log('Fetching more episodes from:', nextPageUrl);
        
        // Make fetch request with timeout
        const response = await fetch(nextPageUrl, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }
        
        const jsonData = await response.json();
        console.log('Received pagination data:', jsonData);
        
        // Handle empty or invalid response
        if (!jsonData) {
          throw new Error('Empty response from server');
        }
        
        // Process the response format from the example
        if (jsonData.relatedStreams && jsonData.relatedStreams.length > 0) {
          // Use functional update for state to avoid race conditions
          setAllEpisodes(prev => {
            // Filter out duplicates using Set and URL as unique identifier
            const existingUrls = new Set(prev.map(p => p.url));
            const newEpisodes = jsonData.relatedStreams.filter((item: Podcast) => !existingUrls.has(item.url));
            console.log(`Adding ${newEpisodes.length} new episodes`);
            return [...prev, ...newEpisodes];
          });
          
          // Update the next page token if available
          if (jsonData.nextpage) {
            console.log('Setting next page token:', jsonData.nextpage);
            setNextPageToken(jsonData.nextpage);
          } else {
            // No more pages
            console.log('No more pages available');
            setNextPageToken(undefined);
          }
        } else {
          console.log('No related streams found in the response');
          // No more items
          setNextPageToken(undefined);
        }
      } catch (fetchError: unknown) {
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.');
        }
        throw fetchError;
      }
    } catch (err: unknown) {
      console.error('Error loading more episodes:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load more episodes: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  
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
    } catch (err: unknown) {
      setError('Failed to play podcast. Please try again.');
      console.error('Play podcast error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isChannelLoading) {
    return <LoadingIndicator />;
  }
  
  if (isError || !channelData) {
    return (
      <main className="flex-grow bg-black text-white container mx-auto px-4 py-6 pb-24">
        <div className="text-center py-12">
          <span className="material-icons text-5xl mb-2 text-gray-400">error</span>
          <h2 className="text-2xl font-semibold mb-2">Channel Not Found</h2>
          <p className="text-gray-300 mb-4">We couldn't find the channel you're looking for.</p>
          <button 
            className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white px-6 py-2 rounded-full shadow-md transition-colors duration-200"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }
  
  // Set the next page token if available
  if (channelData.nextpage && !nextPageToken) {
    setNextPageToken(channelData.nextpage);
  }
  
  return (
    <main className="flex-grow pb-24 bg-black text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center space-x-4 mb-4">
          <button 
            className="flex items-center text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
            onClick={() => navigate('/')}
          >
            <span className="material-icons mr-1">home</span>
            Home
          </button>
          
          <button 
            className="flex items-center text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
            onClick={() => navigate('/')}
          >
            <span className="material-icons mr-1">arrow_back</span>
            Back
          </button>
        </div>
      
        <div className="bg-background dark:bg-zinc-900 rounded-lg shadow-md overflow-hidden mb-6">
          <div className="relative h-32 md:h-48 bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-700 dark:to-orange-900">
            {channelData.bannerUrl && (
              <img 
                src={channelData.bannerUrl} 
                alt={`${channelData.name} banner`}
                className="absolute w-full h-full object-cover"
              />
            )}
            <div className="absolute -bottom-12 left-6 w-24 h-24 bg-white rounded-full p-1 shadow-md">
              <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {channelData.avatarUrl ? (
                  <img 
                    src={channelData.avatarUrl}
                    alt={channelData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="material-icons text-4xl text-gray-500">podcasts</span>
                )}
              </div>
            </div>
          </div>
          <div className="pt-14 pb-6 px-6">
            <h2 className="text-2xl font-medium text-foreground">{channelData.name}</h2>
            <div className="flex items-center text-muted-foreground mt-1">
              <span className="material-icons text-sm mr-1">people</span>
              <span>{channelData.subscribers || 'N/A subscribers'}</span>
            </div>
            {channelData.description && (
              <p className="mt-4 text-foreground">{channelData.description}</p>
            )}
          </div>
        </div>
        
        <h3 className="text-xl font-medium mb-4 text-foreground">Channel Episodes</h3>
        
        {allEpisodes && allEpisodes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {allEpisodes.map((podcast: Podcast, index: number) => (
              <PodcastCard 
                key={`${podcast.url}-${index}`} 
                podcast={podcast}
                onClick={() => handlePlayPodcast(podcast)}
                priority={index < 8} // Prioritize loading first 8 for better performance
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground bg-zinc-900/50 rounded-lg p-10 shadow-sm">
            <span className="material-icons text-5xl mb-3 text-orange-500/70">podcasts</span>
            <p>No episodes found for this channel</p>
          </div>
        )}
        
        {nextPageToken && (
          <div className="mt-8 text-center">
            <button 
              className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white px-8 py-3 rounded-full shadow-md transition-colors duration-200 flex items-center mx-auto"
              onClick={handleLoadMore}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  Loading...
                </>
              ) : (
                <>
                  <span className="material-icons mr-2">expand_more</span>
                  Load More
                </>
              )}
            </button>
          </div>
        )}
        
        {isLoading && <LoadingIndicator />}
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
        
        {/* Additional padding at the bottom for the audio player */}
        <div className="h-32"></div>
      </div>
    </main>
  );
};

export default ChannelView;