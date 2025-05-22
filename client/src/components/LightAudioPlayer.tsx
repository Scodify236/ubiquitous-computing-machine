import { useRef, useEffect, useState } from "react";
import { Podcast, AudioStream, VideoStream } from "@/types/podcast";
import { formatDuration, getYouTubeThumbnail, extractVideoIdFromUrl } from "@/api/podcast";
import { useAudioPlayerStore } from "@/store/index";

interface LightAudioPlayerProps {
  podcast: Podcast;
  audioStream: AudioStream | null;
  isPlaying: boolean;
  onTogglePlay: (isPlaying: boolean) => void;
  onShare?: () => void;
}

const LightAudioPlayer = ({ podcast, audioStream, isPlaying, onTogglePlay, onShare }: LightAudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get video-related state from the store
  const { videoStream, isVideoMode, toggleVideoMode } = useAudioPlayerStore();
  
  // Calculate progress percentage for progress bar
  const progressPercent = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;
  
  // Handle audio playback state
  useEffect(() => {
    const audioElement = audioRef.current;
    const videoElement = videoRef.current;
    
    if (audioElement) {
      if (isPlaying) {
        audioElement.play().catch(error => {
          console.error("Audio playback failed:", error);
          onTogglePlay(false);
        });
        
        // If video exists and we're in video mode, play the video as well
        if (videoElement && isVideoMode) {
          videoElement.play().catch(error => {
            console.error("Video playback failed:", error);
          });
        }
      } else {
        audioElement.pause();
        
        // If video exists, pause it as well
        if (videoElement) {
          videoElement.pause();
        }
      }
    }
  }, [isPlaying, onTogglePlay, isVideoMode]);

  // Handle volume changes
  useEffect(() => {
    const audioElement = audioRef.current;
    
    if (audioElement) {
      audioElement.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);
  
  // Handle video mode toggling - fetch video stream when video mode is enabled
  useEffect(() => {
    // If video mode is enabled and no video stream is available, try to fetch it
    if (isVideoMode && podcast) {
      const videoId = extractVideoIdFromUrl(podcast.url);
      if (videoId) {
        console.log("Fetching video stream for video ID:", videoId);
        // Show some visual indication that video is loading
        
        // Use the getVideoStream API function to fetch the video stream
        fetch(`https://backendmix.vercel.app/video/${videoId}`)
          .then(response => response.json())
          .then(data => {
            console.log("Video API response:", data);
            if (data.status === "success" && data.url) {
              // Create a VideoStream object from the API response
              const videoStream: VideoStream = {
                url: data.url,
                quality: data.quality || "480p",
                mimeType: "video/mp4",
                codec: "h264",
                bitrate: 1000000, // Approximate bitrate
                contentLength: 0, // Unknown content length
                videoQuality: data.quality || "480p",
                height: parseInt(data.quality || "480", 10),
                width: Math.round(parseInt(data.quality || "480", 10) * 16 / 9)
              };
                
              // Update the video stream in the store
              useAudioPlayerStore.getState().setVideoStream(videoStream);
              console.log("Video stream set in store:", videoStream);
            }
          })
          .catch(error => {
            console.error("Failed to fetch video stream:", error);
          });
      }
    }
  }, [isVideoMode, videoStream, podcast]);
  
  // Handle video mode change
  useEffect(() => {
    console.log("Video mode changed:", isVideoMode);
  }, [isVideoMode]);
  
  // Audio event handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };
  
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    
    // Update both audio and video time if available
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    
    // Also update video time if in video mode
    if (isVideoMode && videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Simplified mini player with improved performance - No progress bar
  if (!isExpanded) {
    return (
      <>
        <audio 
          ref={audioRef}
          src={audioStream?.url || ""}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          preload="metadata" 
          aria-label={`Playing ${podcast.title} by ${podcast.uploaderName}`}
          hidden
        />
        
        <section 
          className="fixed bottom-6 left-0 right-0 mx-auto w-[90%] max-w-sm bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl backdrop-saturate-150 z-40 rounded-[40px] shadow-2xl border border-gray-200/40 dark:border-zinc-800/30 overflow-hidden transition-all duration-300 transform-gpu will-change-transform hover:scale-[1.02] hover:shadow-orange-500/10"
          role="complementary"
          aria-label="Mini Player"
        >
          {/* Background elements merged for better performance */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white dark:from-zinc-900 dark:to-black pointer-events-none opacity-100">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 dark:from-orange-600/20 to-transparent"></div>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-orange-500/10 via-white/5 to-orange-500/10 dark:from-orange-500/20 dark:via-white/10 dark:to-orange-500/20"></div>
          </div>
          
          <div className="relative z-10 flex items-center p-2 px-3">
            {/* Thumbnail with simplified structure */}
            <button 
              onClick={toggleExpanded}
              className="group w-10 h-10 flex-shrink-0 rounded-full overflow-hidden mr-3 shadow-md border border-gray-200/60 dark:border-zinc-700/40 relative focus:outline-none focus:ring-2 focus:ring-orange-400/40"
              aria-label="Expand player"
            >
              <img 
                src={getYouTubeThumbnail(podcast.url, 'default')} 
                alt=""
                loading="eager"
                width="40"
                height="40"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              {/* Single overlay for better performance */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 dark:from-orange-500/30 to-transparent opacity-50 group-hover:opacity-70 dark:opacity-70 dark:group-hover:opacity-90 transition-opacity"></div>
            </button>
            
            {/* Title and artist - now using HTML5 semantic elements */}
            <div 
              onClick={toggleExpanded}
              className="flex-1 min-w-0 mr-3 text-left group focus:outline-none cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label="Expand player"
            >
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white truncate drop-shadow-sm group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors">{podcast.title}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 truncate group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">{podcast.uploaderName}</p>
            </div>
            
            {/* Play/Pause button with modern styling */}
            <button 
              onClick={(e) => {
                e.stopPropagation(); // Prevent mini-player from expanding when clicking play button
                onTogglePlay(!isPlaying);
              }}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-lg hover:shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all duration-200"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-white">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-white ml-1">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              )}
            </button>
          </div>
        </section>
      </>
    );
  }

  // Expanded player with enhanced styling
  return (
    <>
      <audio 
        ref={audioRef}
        src={audioStream?.url || ""}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        preload="metadata"
        aria-label={`Playing ${podcast.title} by ${podcast.uploaderName}`}
        hidden
      />
      
      <div className="fixed inset-0 bg-gray-100 dark:bg-zinc-900 z-50 flex flex-col player-backdrop">
        
        {/* Simplified header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 backdrop-blur-[25px] sticky top-0 z-10 shadow-md">
          <button 
            onClick={toggleExpanded}
            className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800/80 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            aria-label="Minimize player"
            title="Minimize player"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          
          <div className="flex flex-col items-center">
            <h3 className="font-bold text-gray-800 dark:text-white">
              Now Playing
            </h3>
            <p className="text-sm font-medium text-orange-500">
              VELIN
            </p>
          </div>
          
          <div className="flex items-center">
            {/* Share Button */}
            {onShare && (
              <button 
                onClick={onShare}
                className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800/80 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                aria-label="Share this episode"
                title="Share this episode"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Content - more compact layout with optimized spacing */}
        <div className="flex-1 overflow-auto">
          <div className="py-6 px-5 md:p-8 flex flex-col lg:flex-row items-center lg:items-start justify-center lg:justify-start lg:space-x-10 max-w-7xl mx-auto w-full">
            {/* Album art with enhanced visuals */}
            <figure className="w-full max-w-xs lg:max-w-md mx-auto lg:mx-0 aspect-video rounded-xl overflow-hidden mb-12 lg:mb-0 lg:sticky lg:top-24 group transform-gpu transition-all duration-500">
              <div className="relative w-full h-full">
                {/* Simplified container without excessive animations */}
                <div className="relative w-full h-full rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-zinc-700/50">
                  {isVideoMode && videoStream ? (
                    <video 
                      ref={videoRef}
                      src={videoStream.url}
                      className="w-full h-full object-cover rounded-xl"
                      poster={getYouTubeThumbnail(podcast.url, 'medium')}
                      playsInline
                      muted
                      autoPlay={isPlaying}
                      controls={false}
                      onLoadStart={() => {
                        console.log("Video loading started");
                        // If video starts loading, temporarily pause audio until video is ready
                        if (audioRef.current && isPlaying) {
                          audioRef.current.pause();
                          // Show loading indicator or message - could be added here
                        }
                      }}
                      onLoadedData={() => {
                        console.log("Video data loaded");
                        // Once video is loaded, resume audio if it was playing
                        if (audioRef.current && isPlaying) {
                          audioRef.current.play().catch(error => {
                            console.error("Error resuming audio after video loaded:", error);
                          });
                        }
                      }}
                      onError={(e) => {
                        console.error("Video error:", (e.target as HTMLVideoElement).error);
                        // If video fails to load, switch back to audio mode
                        if (isVideoMode) {
                          toggleVideoMode();
                          // Resume audio playback if it was previously playing
                          if (audioRef.current && isPlaying) {
                            audioRef.current.play().catch(error => {
                              console.error("Error resuming audio after video error:", error);
                            });
                          }
                        }
                      }}
                      onTimeUpdate={() => {
                        console.log("Video time update", videoRef.current?.currentTime);
                        // Sync video time with audio time
                        if (videoRef.current && audioRef.current && Math.abs(videoRef.current.currentTime - audioRef.current.currentTime) > 0.5) {
                          videoRef.current.currentTime = audioRef.current.currentTime;
                        }
                      }}
                      onClick={() => onTogglePlay(!isPlaying)}
                    />
                  ) : (
                    <img 
                      src={getYouTubeThumbnail(podcast.url, 'medium')}
                      alt={podcast.title}
                      className="w-full h-full object-cover rounded-xl"
                      loading="eager"
                      width="480"
                      height="270"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = podcast.thumbnail;
                      }}
                    />
                  )}
                  
                  {/* Enhanced gradient overlay - only show when not in video mode */}
                  {!isVideoMode && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10"></div>
                  )}
                  
                  {/* Remove the overlay toggle button */}
                  
                  {/* Simplified play indicator with SVG icon - only visible when thumbnail is clicked */}
                  {(!isVideoMode || !isPlaying) && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 pointer-events-none">
                      <div className="w-14 h-14 bg-orange-500/80 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg">
                        {isPlaying ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white">
                            <rect x="6" y="4" width="4" height="16"></rect>
                            <rect x="14" y="4" width="4" height="16"></rect>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white ml-1">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                          </svg>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Styled toggle switch for Video/Audio mode - positioned below thumbnail */}
              <div className="flex justify-center items-center mt-6 mb-2">
                <div className="flex items-center space-x-3 bg-gray-100 dark:bg-zinc-800 rounded-full px-4 py-2 border border-gray-200 dark:border-zinc-700/50 shadow-md">
                  <span className={`text-sm font-medium ${!isVideoMode ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'}`}>
                    Audio
                  </span>
                  
                  <button
                    onClick={() => {
                      toggleVideoMode();
                      console.log("Video toggle clicked, isVideoMode:", !isVideoMode);
                      
                      if (!isVideoMode && videoRef.current && audioRef.current && isPlaying) {
                        videoRef.current.currentTime = audioRef.current.currentTime;
                        videoRef.current.play().catch(err => console.error("Failed to play video:", err));
                      }
                    }}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                    style={{
                      backgroundColor: isVideoMode ? '#f97316' : '#d1d5db',
                    }}
                    aria-label={isVideoMode ? "Switch to audio mode" : "Switch to video mode"}
                    role="switch"
                    aria-checked={isVideoMode}
                  >
                    <span 
                      className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform"
                      style={{
                        transform: isVideoMode ? 'translateX(20px)' : 'translateX(2px)',
                      }}
                    />
                  </button>
                  
                  <span className={`text-sm font-medium ${isVideoMode ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'}`}>
                    Video
                  </span>
                </div>
              </div>
            </figure>
            
            {/* Player controls and info - improved spacing and visuals */}
            <div className="flex flex-col w-full max-w-md lg:pt-4 lg:flex-1">
              {/* Enhanced channel info with avatar */}
              <div className="hidden lg:flex items-center space-x-3 mb-6 bg-gray-100 dark:bg-zinc-800 backdrop-blur-sm px-4 py-2 rounded-full">
                <figure className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-zinc-700/50">
                  <img 
                    src={podcast.uploaderAvatar || getYouTubeThumbnail(podcast.url, 'default')} 
                    alt={podcast.uploaderName}
                    width="32"
                    height="32"
                    loading="eager"
                    className="w-full h-full object-cover"
                  />
                </figure>
                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{podcast.uploaderName}</span>
                {podcast.uploaderVerified && (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-orange-500"
                    aria-label="Verified creator"
                    role="img"
                  >
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                    <path d="m9 12 2 2 4-4"></path>
                  </svg>
                )}
              </div>
              
              {/* Compact title with elegant typography */}
              <h2 className="text-xl lg:text-3xl font-bold text-gray-800 dark:text-white text-center lg:text-left mb-3 leading-tight">{podcast.title}</h2>
              <p className="text-gray-600 dark:text-gray-300 text-center lg:text-left mb-6 lg:hidden">
                {podcast.uploaderName}
                {podcast.uploaderVerified && (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-orange-500 inline-block ml-1"
                    aria-label="Verified creator"
                    role="img"
                  >
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                    <path d="m9 12 2 2 4-4"></path>
                  </svg>
                )}
              </p>
              
              {/* Streamlined modern progress bar */}
              <div className="w-full mb-4 mt-6 relative">
                <div className="w-full bg-gray-200/70 dark:bg-zinc-700/70 h-1.5 rounded-full overflow-hidden backdrop-blur-sm">
                  <input 
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    step="0.1"
                    onChange={handleProgressChange}
                    className="w-full h-1.5 cursor-pointer accent-orange-500 appearance-none rounded-full bg-transparent relative z-10"
                    aria-label="Audio progress"
                    style={{
                      background: `linear-gradient(to right, #f97316 0%, #f97316 ${(currentTime / (duration || 100)) * 100}%, transparent ${(currentTime / (duration || 100)) * 100}%)`
                    }}
                  />
                </div>
              </div>
              
              {/* Time indicators with improved styling */}
              <div className="w-full flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-6">
                <time dateTime={`PT${Math.floor(currentTime)}S`} className="tabular-nums">{formatDuration(currentTime)}</time>
                <time dateTime={`PT${Math.floor(duration)}S`} className="tabular-nums">{formatDuration(duration)}</time>
              </div>
              
              {/* Modernized controls with enhanced styling */}
              <div className="flex items-center justify-center lg:justify-center space-x-12 md:space-x-14" role="group" aria-label="Audio player controls">
                <button 
                  className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 bg-gray-100/80 dark:bg-zinc-800/80 text-gray-700 dark:text-gray-200 backdrop-blur-sm shadow-md hover:shadow-lg hover:bg-gray-50/90 dark:hover:bg-zinc-700/90 hover:scale-105"
                  onClick={() => {
                    const newTime = Math.max(0, currentTime - 15);
                    // Update both audio and video time
                    if (audioRef.current) {
                      audioRef.current.currentTime = newTime;
                      setCurrentTime(newTime);
                    }
                    // Sync with video if in video mode
                    if (isVideoMode && videoRef.current) {
                      videoRef.current.currentTime = newTime;
                    }
                  }}
                  aria-label="Rewind 15 seconds"
                  title="Rewind 15 seconds"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    <path d="M11 17l-5-5 5-5"></path>
                    <path d="M18 17l-5-5 5-5"></path>
                  </svg>
                </button>
                
                <button 
                  onClick={() => onTogglePlay(!isPlaying)}
                  className="w-20 h-20 md:w-22 md:h-22 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-orange-500/30 shadow-lg shadow-orange-500/10 backdrop-blur-sm"
                  aria-label={isPlaying ? "Pause" : "Play"}
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-white">
                      <rect x="6" y="4" width="4" height="16"></rect>
                      <rect x="14" y="4" width="4" height="16"></rect>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-white ml-1">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  )}
                </button>
                
                <button 
                  className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 bg-gray-100/80 dark:bg-zinc-800/80 text-gray-700 dark:text-gray-200 backdrop-blur-sm shadow-md hover:shadow-lg hover:bg-gray-50/90 dark:hover:bg-zinc-700/90 hover:scale-105"
                  onClick={() => {
                    const newTime = Math.min(duration, currentTime + 15);
                    // Update both audio and video time
                    if (audioRef.current) {
                      audioRef.current.currentTime = newTime;
                      setCurrentTime(newTime);
                    }
                    // Sync with video if in video mode
                    if (isVideoMode && videoRef.current) {
                      videoRef.current.currentTime = newTime;
                    }
                  }}
                  aria-label="Forward 15 seconds"
                  title="Forward 15 seconds"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    <path d="M13 17l5-5-5-5"></path>
                    <path d="M6 17l5-5-5-5"></path>
                  </svg>
                </button>
              </div>
              
              {/* Enhanced additional controls */}
              <div className="flex justify-center mt-6 space-x-6" role="group" aria-label="Additional controls">
                <button 
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors rounded-full px-5 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50 bg-gray-100/90 hover:bg-gray-200 dark:bg-zinc-800/90 dark:hover:bg-zinc-700 border border-gray-200/40 dark:border-zinc-700/40 backdrop-blur-sm shadow-sm hover:shadow"
                  title="Add to Playlist"
                  aria-label="Add to Playlist"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M3 6h18"></path>
                    <path d="M3 12h18"></path>
                    <path d="M3 18h12"></path>
                    <path d="M19 15v6"></path>
                    <path d="M16 18h6"></path>
                  </svg>
                  <span className="text-sm">Add to Playlist</span>
                </button>
                <button 
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors rounded-full px-5 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50 bg-gray-100/90 hover:bg-gray-200 dark:bg-zinc-800/90 dark:hover:bg-zinc-700 border border-gray-200/40 dark:border-zinc-700/40 backdrop-blur-sm shadow-sm hover:shadow"
                  title="Like"
                  aria-label="Like this episode"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M7 10v12"></path>
                    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                  </svg>
                  <span className="text-sm">Like</span>
                </button>
              </div>
              
              {/* Enhanced episode details with modern card design */}
              <section className="mt-12 pt-6 border-t border-gray-200/50 dark:border-zinc-800/50">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500 mr-2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4"></path>
                    <path d="M12 8h.01"></path>
                  </svg>
                  About this episode
                </h3>
                <div className="bg-white dark:bg-zinc-800 rounded-2xl p-5 shadow-lg border border-gray-200/40 dark:border-zinc-700/40 backdrop-blur-sm">
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {podcast.shortDescription || 'Listen to this amazing podcast episode by ' + podcast.uploaderName + '. Share and enjoy the content on VELIN.'}
                  </p>
                </div>
                
                {/* Tags section */}
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Tags</h4>
                  <ul className="flex flex-wrap gap-2" aria-label="Content tags">
                    {['podcast', 'audio', 'music', 'entertainment'].map((tag, i) => (
                      <li key={i} className="px-3 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LightAudioPlayer;