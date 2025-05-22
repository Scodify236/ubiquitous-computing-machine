import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getAudioStream, extractChannelIdFromUrl, formatDuration, formatViews } from "@/api/podcast";
import PodcastCard from "@/components/PodcastCard";
import LoadingIndicator from "@/components/LoadingIndicator";
import ErrorMessage from "@/components/ErrorMessage";
import { Podcast, AudioStream } from "@/types/podcast";

interface PodcastDetailProps {
  id: string;
  onPlayPodcast: (podcast: Podcast, stream: AudioStream) => void;
}

const PodcastDetail = ({ id, onPlayPodcast }: PodcastDetailProps) => {
  const [, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [relatedEpisodes, setRelatedEpisodes] = useState<Podcast[]>([]);
  
  // Get audio stream data directly from the external API
  const { data: streamData, isLoading, isError } = useQuery({
    queryKey: [`podcast-${id}`],
    queryFn: async () => {
      try {
        const response = await fetch(`https://backendmix-emergeny.vercel.app/streams/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch stream data: ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching stream data:', error);
        throw error;
      }
    }
  }) as { 
    data: { 
      title: string; 
      uploader: string; 
      uploaderUrl: string | null; 
      duration: number; 
      audioStreams: AudioStream[] 
    } | undefined; 
    isLoading: boolean; 
    isError: boolean 
  };
  
  useEffect(() => {
    if (isError) {
      setError('Failed to load podcast details. Please try again.');
    } else {
      setError(null);
    }
  }, [isError]);
  
  // Generate podcast data based on stream data with direct API access for thumbnail
  useEffect(() => {
    if (streamData) {
      // Create optimized thumbnail URLs directly from YouTube's API
      // Use high quality thumbnail with multiple fallbacks
      const thumbnailOptions = [
        `https://img.youtube.com/vi/${id}/maxresdefault.jpg`, // HD Quality
        `https://img.youtube.com/vi/${id}/hqdefault.jpg`,     // High Quality
        `https://img.youtube.com/vi/${id}/mqdefault.jpg`,     // Medium Quality
        `https://img.youtube.com/vi/${id}/sddefault.jpg`,     // Standard Quality
        `https://img.youtube.com/vi/${id}/default.jpg`        // Default Quality
      ];

      // Create a podcast object from the stream data
      setPodcast({
        type: 'stream',
        url: `/watch?v=${id}`,
        title: streamData.title,
        thumbnail: thumbnailOptions[0], // Start with highest quality
        uploaderName: streamData.uploader,
        uploaderUrl: streamData.uploaderUrl || '',
        uploadedDate: 'Recently',
        duration: streamData.duration,
        views: 0,
        uploaderVerified: false,
        shortDescription: 'No description available',
        uploaded: Date.now() / 1000,
        uploaderAvatar: null,
        isShort: false,
        // Add all thumbnail options for fallback
        thumbnailOptions
      });
      
      // In a real application, we would fetch related episodes from the API
      // For now, we're just creating empty placeholders
      setRelatedEpisodes([]);
    }
  }, [streamData, id]);
  
  const handlePlay = () => {
    try {
      if (podcast && streamData && streamData.audioStreams && streamData.audioStreams.length > 0) {
        // Add memory optimization by selecting the optimal audio stream
        // Based on quality and bitrate to avoid unnecessary buffering
        let optimalStream = streamData.audioStreams[0];
        
        // Find a mid-quality stream for better performance if multiple options exist
        if (streamData.audioStreams.length > 1) {
          // Sort by bitrate, ascending
          const sortedStreams = [...streamData.audioStreams].sort((a, b) => a.bitrate - b.bitrate);
          
          // Choose a stream with medium bitrate if available (for better performance)
          const midIndex = Math.floor(sortedStreams.length / 2);
          if (midIndex > 0) {
            optimalStream = sortedStreams[midIndex];
          }
        }
        
        onPlayPodcast(podcast, optimalStream);
      } else {
        setError('Failed to play podcast. No audio stream available.');
      }
    } catch (err) {
      console.error('Error while playing podcast:', err);
      setError('An error occurred while trying to play the podcast.');
    }
  };
  
  const handleViewChannel = () => {
    if (podcast) {
      const channelId = extractChannelIdFromUrl(podcast.uploaderUrl);
      if (channelId) {
        navigate(`/channel/${channelId}`);
      } else {
        setError('Channel information not available');
      }
    }
  };
  
  if (isLoading) {
    return <LoadingIndicator />;
  }
  
  if (!podcast) {
    return (
      <main className="flex-grow dark:bg-black container mx-auto px-4 py-6 pb-24">
        <div className="text-center py-12">
          <span className="material-icons text-5xl mb-2 text-gray-400">podcasts</span>
          <h2 className="text-2xl font-semibold mb-2 text-foreground">Podcast Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">We couldn't find the podcast you're looking for.</p>
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
  
  return (
    <main className="flex-grow pb-24 dark:bg-black">
      <div className="container mx-auto px-4 py-4">
        <div className="mb-6 flex items-center space-x-4">
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
      
        <div className="mb-6">
          <div className="bg-background dark:bg-zinc-900 rounded-lg shadow-md overflow-hidden">
            <div className="relative pb-[56.25%] md:pb-[40%] bg-muted/20 dark:bg-muted/10 overflow-hidden">
              <img 
                src={podcast.thumbnail} 
                alt={podcast.title} 
                className="absolute w-full h-full object-cover transition-opacity duration-300"
                onError={(e) => {
                  // Use the array of thumbnails for fallback
                  const target = e.target as HTMLImageElement;
                  const thumbnailOptions = (podcast as any).thumbnailOptions as string[] || [];
                  
                  // Find current index
                  const currentIndex = thumbnailOptions.findIndex(url => url === target.src);
                  
                  if (currentIndex >= 0 && currentIndex < thumbnailOptions.length - 1) {
                    // Try the next thumbnail in the options array
                    target.src = thumbnailOptions[currentIndex + 1];
                  } else {
                    // We've tried all options, use a generic podcast icon with gradient background
                    target.src = '';
                    target.classList.add('opacity-0');
                    target.parentElement?.classList.add('bg-gradient-to-br', 'from-orange-500/20', 'to-orange-500/5');
                    
                    // Add a podcast icon
                    const iconDiv = document.createElement('div');
                    iconDiv.className = 'absolute inset-0 flex items-center justify-center';
                    iconDiv.innerHTML = '<span class="material-icons text-6xl text-orange-500/70">podcasts</span>';
                    target.parentElement?.appendChild(iconDiv);
                  }
                }}
                loading="eager"
              />
              {/* Overlay gradient for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-40"></div>
            </div>
            
            <div className="p-6">
              <h2 className="text-2xl font-medium mb-2 text-foreground">{podcast.title}</h2>
              
              <div className="flex items-center mb-4">
                <button 
                  className="flex items-center text-orange-500 font-medium hover:underline"
                  onClick={handleViewChannel}
                >
                  <span>{podcast.uploaderName}</span>
                  {podcast.uploaderVerified && (
                    <span className="material-icons text-orange-500 text-sm ml-1">verified</span>
                  )}
                </button>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center">
                  <span className="material-icons text-sm mr-1">schedule</span>
                  <span>{formatDuration(podcast.duration)}</span>
                </div>
                {podcast.views > 0 && (
                  <div className="flex items-center">
                    <span className="material-icons text-sm mr-1">visibility</span>
                    <span>{formatViews(podcast.views)} views</span>
                  </div>
                )}
                <div className="flex items-center">
                  <span className="material-icons text-sm mr-1">calendar_today</span>
                  <span>{podcast.uploadedDate}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <button 
                  className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white px-6 py-2 rounded-full shadow-md transition-colors duration-200 flex items-center"
                  onClick={handlePlay}
                >
                  <span className="material-icons mr-2">play_arrow</span>
                  Play Episode
                </button>
              </div>
              
              {podcast.shortDescription && (
                <div className="border-t border-border/20 pt-4">
                  <p className="text-foreground">{podcast.shortDescription}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      
        {relatedEpisodes.length > 0 && (
          <>
            <h3 className="text-xl font-medium mb-4 text-foreground">Related Episodes</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedEpisodes.map((episode, index) => (
                <PodcastCard 
                  key={`${episode.url}-${index}`} 
                  podcast={episode}
                  onClick={() => handlePlay()}
                />
              ))}
            </div>
          </>
        )}
        
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
        
        {/* Additional padding at the bottom for the audio player */}
        <div className="h-32"></div>
      </div>
    </main>
  );
};

export default PodcastDetail;