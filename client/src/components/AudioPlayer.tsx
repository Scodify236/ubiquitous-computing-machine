import { useRef, useEffect, RefObject } from "react";
import { Podcast, AudioStream, VideoStream } from "@/types/podcast";
import { formatDuration, getYouTubeThumbnail, extractVideoIdFromUrl } from "@/api/podcast";
import { useAudioPlayerStore } from "@/store/index";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  podcast: Podcast;
  audioStream: AudioStream | null;
  isPlaying: boolean;
  onTogglePlay: (isPlaying: boolean) => void;
  onShare?: () => void;
}

const AudioPlayer = ({ podcast, audioStream, isPlaying, onTogglePlay, onShare }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeSliderRef = useRef<HTMLDivElement>(null);
  const expandedProgressBarRef = useRef<HTMLInputElement>(null);
  
  const { 
    isExpanded, 
    toggleExpanded,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    sleepTimer,
    sleepTimerEndTime,
    isVideoMode,
    toggleVideoMode,
    videoStream
  } = useAudioPlayerStore();
  
  const { 
    handleTimeUpdate,
    handleLoadedMetadata,
    handleProgressBarClick,
    handleVolumeChange,
    handleExpandedProgressBarClick
  } = useAudioPlayer({
    audioRef,
    progressBarRef,
    volumeSliderRef,
    expandedProgressBarRef,
    isPlaying,
    onTogglePlay,
    setCurrentTime,
    setDuration,
    volume,
    setVolume,
    isMuted
  });

  useEffect(() => {
    const audioElement = audioRef.current;
    
    if (audioElement) {
      if (isPlaying) {
        audioElement.play().catch(error => {
          console.error("Audio playback failed:", error);
          onTogglePlay(false);
        });
      } else {
        audioElement.pause();
      }
    }
  }, [isPlaying, onTogglePlay]);

  useEffect(() => {
    const audioElement = audioRef.current;
    
    if (audioElement) {
      audioElement.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);
  
  // Handle video playback state and synchronization with audio
  useEffect(() => {
    const audioElement = audioRef.current;
    const videoElement = videoRef.current;
    
    if (isVideoMode && videoElement && audioElement && isPlaying) {
      // Sync video with audio time
      videoElement.currentTime = audioElement.currentTime;
      
      // Play the video when audio is playing
      videoElement.play().catch(error => {
        console.error("Video playback failed:", error);
      });
    } else if (videoElement) {
      // Pause video when not in video mode or audio is paused
      videoElement.pause();
    }
  }, [isPlaying, isVideoMode]);
  
  // Keep video in sync with audio time updates
  useEffect(() => {
    const audioElement = audioRef.current;
    const videoElement = videoRef.current;
    
    // Function to sync video time with audio time
    const syncVideoWithAudio = () => {
      if (isVideoMode && videoElement && audioElement && Math.abs(videoElement.currentTime - audioElement.currentTime) > 0.5) {
        videoElement.currentTime = audioElement.currentTime;
      }
    };
    
    if (audioElement && videoElement && isVideoMode) {
      audioElement.addEventListener('timeupdate', syncVideoWithAudio);
    }
    
    return () => {
      if (audioElement) {
        audioElement.removeEventListener('timeupdate', syncVideoWithAudio);
      }
    };
  }, [isVideoMode]);
  
  // Fetch video stream when video mode is toggled on
  useEffect(() => {
    // If video mode is enabled but no video stream is available, fetch it
    if (isVideoMode && !videoStream && podcast) {
      const videoId = extractVideoIdFromUrl(podcast.url);
      if (videoId) {
        console.log("Fetching video stream for video ID:", videoId);
        
        // Show some visual indication that video is loading
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
              
              // Update the store with the video stream
              useAudioPlayerStore.getState().setVideoStream(videoStream);
            }
          })
          .catch(error => {
            console.error("Failed to fetch video stream:", error);
          });
      }
    }
  }, [isVideoMode, videoStream, podcast]);
  
  // Sleep timer effect
  useEffect(() => {
    let sleepTimerInterval: number | undefined;
    
    if (sleepTimerEndTime) {
      // Set an interval to check if the sleep timer has expired
      sleepTimerInterval = window.setInterval(() => {
        const now = Date.now();
        const timeLeft = sleepTimerEndTime - now;
        
        // If timer expired, pause playback and clear the timer
        if (timeLeft <= 0) {
          if (isPlaying) {
            onTogglePlay(false);
          }
          useAudioPlayerStore.getState().clearSleepTimer();
        }
      }, 1000);
    }
    
    // Cleanup the interval when component unmounts or timer changes
    return () => {
      if (sleepTimerInterval) {
        clearInterval(sleepTimerInterval);
      }
    };
  }, [sleepTimerEndTime, isPlaying, onTogglePlay]);

  return (
    <>
      <audio 
        ref={audioRef}
        src={audioStream?.url || ""}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        hidden
      />
      
      {/* Video element for video mode */}
      {isVideoMode && videoStream && (
        <video
          ref={videoRef}
          src={videoStream.url}
          className="hidden"
          playsInline
          muted
        />
      )}
      
      {/* Enhanced Immersive Fullscreen Player */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-white dark:bg-zinc-900">
          {/* Dynamic Background with Art-Based Gradient */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20 dark:opacity-15" 
            style={{ 
              backgroundImage: `url(${getYouTubeThumbnail(podcast.url, 'maxres')})`,
              filter: 'blur(100px) saturate(180%)'
            }}
          ></div>
          
          {/* Improved Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/95 to-white dark:from-zinc-900/80 dark:via-zinc-900/95 dark:to-zinc-900"></div>
          
          {/* Main Content Container with Better Organization */}
          <div className="relative z-10 flex flex-col h-full max-h-screen">
            {/* Modernized Header with Centered Title */}
            <div className="sticky top-0 py-5 px-6 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800/50 backdrop-blur-md bg-white/70 dark:bg-zinc-900/70 relative">
              <button 
                onClick={toggleExpanded}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 shadow-md hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all border border-gray-100 dark:border-zinc-700 z-10"
                aria-label="Close fullscreen player"
              >
                <span className="material-icons">keyboard_arrow_down</span>
              </button>
              
              {/* Centered title */}
              <div className="absolute left-0 right-0 mx-auto flex flex-col items-center justify-center pointer-events-none">
                <h4 className="font-bold text-xl text-gray-800 dark:text-white">
                  Now Playing
                </h4>
                <p className="text-sm font-medium text-orange-500">
                  VELIN
                </p>
              </div>
              
              {/* Share button */}
              {onShare && (
                <button 
                  className="w-12 h-12 rounded-full flex items-center justify-center bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 shadow-md hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all border border-gray-100 dark:border-zinc-700 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare();
                  }}
                  aria-label="Share"
                >
                  <span className="material-icons">share</span>
                </button>
              )}
            </div>
            
            {/* Redesigned Sleep Timer Menu with Better Styling */}
            <div 
              id="sleep-timer-menu" 
              className="absolute top-20 right-6 bg-white dark:bg-zinc-800 rounded-xl shadow-xl z-50 p-3 hidden border border-gray-100 dark:border-zinc-700"
            >
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 px-2">Sleep Timer</h4>
              <div className="flex flex-col space-y-1">
                {[5, 10, 15, 30, 45, 60].map(minutes => (
                  <button 
                    key={minutes}
                    className={cn(
                      "py-2 px-4 text-left rounded-lg text-sm flex items-center justify-between",
                      sleepTimer === minutes 
                        ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400" 
                        : "hover:bg-gray-100 dark:hover:bg-zinc-700"
                    )}
                    onClick={() => {
                      // Set the sleep timer
                      useAudioPlayerStore.getState().setSleepTimer(minutes);
                      // Close the menu
                      const timerMenu = document.getElementById('sleep-timer-menu');
                      if (timerMenu) {
                        timerMenu.classList.add('hidden');
                      }
                    }}
                  >
                    <span>{minutes} minutes</span>
                    {sleepTimer === minutes && (
                      <span className="material-icons text-orange-500 text-sm">check</span>
                    )}
                  </button>
                ))}
                {sleepTimer && (
                  <button 
                    className="py-2 px-4 text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm mt-2 border-t border-gray-100 dark:border-zinc-700"
                    onClick={() => {
                      // Clear the sleep timer
                      useAudioPlayerStore.getState().clearSleepTimer();
                      // Close the menu
                      const timerMenu = document.getElementById('sleep-timer-menu');
                      if (timerMenu) {
                        timerMenu.classList.add('hidden');
                      }
                    }}
                  >
                    <span className="flex items-center">
                      <span className="material-icons text-sm mr-1">close</span>
                      Cancel Timer
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Main Content Area with fixed height and scrolling */}
            <div className="flex flex-col items-center justify-start h-[calc(100vh-70px)] py-6 px-4 overflow-y-auto">
              {/* Sleep Timer Indicator */}
              {sleepTimer && (
                <div className="px-6 py-2 bg-orange-500/10 dark:bg-orange-900/20 rounded-full mb-8 flex items-center space-x-2 animate-pulse">
                  <span className="material-icons text-orange-500 text-sm">bedtime</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Sleep timer: {sleepTimer} minutes
                  </span>
                </div>
              )}
              
              {/* Rectangular Album Art/Video Container with 16:9 Aspect Ratio */}
              <div className="w-full max-w-2xl px-4 flex-shrink-0 mb-4">
                <div className="relative rounded-xl overflow-hidden shadow-lg dark:shadow-md mx-auto aspect-video transform transition-transform duration-500 group">
                  {/* Show video when in video mode and video stream is available */}
                  {isVideoMode && videoStream ? (
                    <video 
                      ref={videoRef}
                      src={videoStream.url}
                      className="w-full h-full object-cover"
                      playsInline
                      autoPlay={isPlaying}
                      loop={false}
                      muted={false}
                      onTimeUpdate={() => {
                        // Keep audio and video in sync
                        if (audioRef.current && videoRef.current) {
                          const diff = Math.abs(audioRef.current.currentTime - videoRef.current.currentTime);
                          if (diff > 0.2) {
                            videoRef.current.currentTime = audioRef.current.currentTime;
                          }
                        }
                      }}
                      onPlay={() => {
                        if (audioRef.current && !audioRef.current.paused) {
                          videoRef.current!.currentTime = audioRef.current.currentTime;
                        }
                      }}
                    />
                  ) : (
                    /* Album Art Image - shown when not in video mode */
                    <img 
                      src={getYouTubeThumbnail(podcast.url, 'maxres')}
                      alt={podcast.title}
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = podcast.thumbnail;
                      }}
                    />
                  )}
                  
                  {/* Subtle Gradient Overlay - less prominent to see video clearly */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                  
                  {/* Playback Info with Better Typography */}
                  <div className="absolute bottom-6 left-6 flex items-center text-white text-sm backdrop-blur-sm bg-black/30 px-3 py-1.5 rounded-full">
                    <span className="material-icons mr-1.5 text-orange-400 text-sm">equalizer</span>
                    <span className="font-medium tracking-wide">{formatDuration(currentTime)} / {formatDuration(duration)}</span>
                  </div>
                  
                  {/* Enhanced Play Button Overlay */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button 
                        className="w-24 h-24 rounded-full bg-black/75 hover:bg-orange-500 text-white flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 border border-white/20 backdrop-blur-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePlay(true);
                        }}
                      >
                        <span className="material-icons text-5xl ml-1.5">play_arrow</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Video/Audio Toggle with improved styling - Moved above title */}
              <div className="w-full flex justify-center mb-6">
                <div className="flex items-center space-x-3 bg-gray-100 dark:bg-zinc-800 rounded-full px-6 py-3 border border-gray-200 dark:border-zinc-700/50 shadow-md">
                  <span className={`text-sm font-medium ${!isVideoMode ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'}`}>
                    Audio
                  </span>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVideoMode();
                      
                      // If toggling to video mode and video is playing, sync with audio
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
              
              {/* Enhanced Podcast Info with Truncation */}
              <div className="w-full max-w-2xl text-center mb-6 px-4 flex-shrink-0">
                <h1 className="text-gray-800 dark:text-gray-100 text-xl md:text-2xl font-bold mb-3 leading-tight tracking-tight line-clamp-2 mx-auto">
                  {podcast.title}
                </h1>
                <div className="flex items-center justify-center">
                  <span className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white mr-2 shadow-md flex-shrink-0">
                    <span className="material-icons text-sm">person</span>
                  </span>
                  <p className="text-gray-700 dark:text-gray-300 text-base flex items-center truncate max-w-[200px]">
                    <span className="truncate">{podcast.uploaderName}</span>
                    {podcast.uploaderVerified && (
                      <span className="material-icons text-orange-500 text-sm ml-1 flex-shrink-0">verified</span>
                    )}
                  </p>
                </div>
              </div>
              
              {/* Controls Section with Better Position and Spacing */}
              <div className="w-full max-w-md px-4 mt-auto flex-shrink-0">
                {/* Improved Progress Controls */}
                <div className="w-full mb-8">
                  {/* Streamlined modern progress bar */}
                  <input 
                    type="range" 
                    min="0" 
                    max={duration || 100} 
                    value={currentTime}
                    step="0.1"
                    className="w-full h-1.5 cursor-pointer smooth-transition accent-orange-500 appearance-none bg-gray-200 dark:bg-zinc-700 rounded-full"
                    onChange={(e) => {
                      const newTime = parseFloat(e.target.value);
                      setCurrentTime(newTime);
                      
                      // Update audio time
                      if (audioRef.current) {
                        audioRef.current.currentTime = newTime;
                      }
                      
                      // Also update video time if in video mode
                      if (isVideoMode && videoRef.current) {
                        videoRef.current.currentTime = newTime;
                      }
                      
                      // Make sure both are in sync
                      if (isVideoMode && videoRef.current && audioRef.current) {
                        const diff = Math.abs(videoRef.current.currentTime - audioRef.current.currentTime);
                        if (diff > 0.2) {
                          videoRef.current.currentTime = audioRef.current.currentTime;
                        }
                      }
                    }}
                    ref={expandedProgressBarRef as React.RefObject<HTMLInputElement>}
                    style={{
                      background: `linear-gradient(to right, #f97316 ${(currentTime / (duration || 1)) * 100}%, ${
                        document.documentElement.classList.contains('dark') ? '#3f3f46' : '#e5e7eb'
                      } ${(currentTime / (duration || 1)) * 100}%)`
                    }}
                  />
                  
                  {/* Time indicators with Better Layout */}
                  <div className="flex justify-between text-gray-500 dark:text-gray-400 mt-3 text-sm font-medium">
                    <span>{formatDuration(currentTime)}</span>
                    <span>-{formatDuration(duration - currentTime)}</span>
                  </div>
                </div>
                {/* Enhanced Media Controls with Clean, Formal Styling */}
                <div className="flex items-center justify-center w-full mb-8">
                  <button 
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 bg-gray-100/80 dark:bg-zinc-800/80 text-gray-700 dark:text-gray-200 backdrop-blur-sm shadow-md hover:shadow-lg hover:bg-gray-50/90 dark:hover:bg-zinc-700/90"
                    onClick={() => {
                      const newTime = Math.max(0, currentTime - 15);
                      // Update audio time
                      if (audioRef.current) {
                        audioRef.current.currentTime = newTime;
                        setCurrentTime(newTime);
                      }
                      
                      // Also update video time if in video mode
                      if (isVideoMode && videoRef.current) {
                        videoRef.current.currentTime = newTime;
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <path d="M11 17l-5-5 5-5"></path>
                      <path d="M18 17l-5-5 5-5"></path>
                    </svg>
                  </button>
                  
                  <button 
                    className="w-16 h-16 md:w-18 md:h-18 mx-5 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center shadow-lg hover:shadow-orange-500/20 transition-all duration-200 hover:scale-105 backdrop-blur-sm"
                    onClick={() => onTogglePlay(!isPlaying)}
                  >
                    {isPlaying ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                        <rect x="6" y="4" width="4" height="16"></rect>
                        <rect x="14" y="4" width="4" height="16"></rect>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 ml-1">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    )}
                  </button>
                  
                  <button 
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 bg-gray-100/80 dark:bg-zinc-800/80 text-gray-700 dark:text-gray-200 backdrop-blur-sm shadow-md hover:shadow-lg hover:bg-gray-50/90 dark:hover:bg-zinc-700/90"
                    onClick={() => {
                      const newTime = Math.min(duration, currentTime + 15);
                      // Update audio time
                      if (audioRef.current) {
                        audioRef.current.currentTime = newTime;
                        setCurrentTime(newTime);
                      }
                      
                      // Also update video time if in video mode
                      if (isVideoMode && videoRef.current) {
                        videoRef.current.currentTime = newTime;
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <path d="M13 17l5-5-5-5"></path>
                      <path d="M6 17l5-5-5-5"></path>
                    </svg>
                  </button>
                </div>
                
                {/* Volume Slider with modern styling */}
                <div className="w-full max-w-xs mx-auto flex items-center space-x-3 mb-4">
                  <button 
                    onClick={toggleMute}
                    className="p-1 rounded-full hover:bg-gray-100/60 dark:hover:bg-zinc-800/60 transition-colors"
                  >
                    {isMuted ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400">
                        <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                        <line x1="23" y1="9" x2="17" y2="15"></line>
                        <line x1="17" y1="9" x2="23" y2="15"></line>
                      </svg>
                    ) : volume < 0.3 ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400">
                        <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400">
                        <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                      </svg>
                    )}
                  </button>
                  <div className="w-full bg-gray-200/70 dark:bg-zinc-700/70 h-1.5 rounded-full overflow-hidden backdrop-blur-sm">
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        const newVolume = parseFloat(e.target.value);
                        setVolume(newVolume);
                        if (newVolume > 0 && isMuted) {
                          toggleMute();
                        }
                      }}
                      className="w-full h-1.5 accent-orange-500 appearance-none rounded-full bg-transparent relative z-10"
                      style={{
                        background: `linear-gradient(to right, #f97316 ${(isMuted ? 0 : volume) * 100}%, transparent ${(isMuted ? 0 : volume) * 100}%)`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Mini Player with video indicator and better layout */}
      <div 
        className={cn(
          "fixed bottom-4 left-0 right-0 mx-auto w-[95%] max-w-md z-50 rounded-xl shadow-xl",
          "border cursor-pointer transition-all duration-300 will-change-transform",
          "backdrop-blur-xl backdrop-saturate-180 border-gray-200/50 dark:border-zinc-700/50 text-gray-800 dark:text-gray-200",
          "bg-white/90 dark:bg-zinc-800/90 hover:shadow-2xl hover:scale-[1.02]",
          isExpanded && "hidden"
        )}
        style={{zIndex: 999}}
        onClick={toggleExpanded}
        role="complementary"
        aria-label="Mini Player"
      >
        {/* Compact interior with better layout */}
        <div className="flex items-center p-2 relative">
          {/* Thumbnail/Cover - now rectangular */}
          <div className="w-14 h-10 rounded-md overflow-hidden mr-3 relative flex-shrink-0 shadow-sm border border-gray-200 dark:border-zinc-700">
            <img 
              src={getYouTubeThumbnail(podcast.url, 'default')}
              alt=""
              loading="eager"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = podcast.thumbnail;
              }}
            />
            {isVideoMode && (
              <div className="absolute top-0.5 right-0.5 bg-orange-500 rounded-full w-3 h-3" title="Video mode enabled"></div>
            )}
          </div>
          
          {/* Podcast info with enforced truncation */}
          <div className="overflow-hidden flex-1 mr-3">
            <div className="flex items-center">
              <h4 className="font-medium text-sm dark:text-gray-200 truncate max-w-[150px] sm:max-w-[200px]">
                {podcast.title}
              </h4>
              {isVideoMode && (
                <span className="material-icons text-orange-500 text-sm ml-1">videocam</span>
              )}
            </div>
            <div className="flex items-center">
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[120px] sm:max-w-[180px]">
                {podcast.uploaderName}
              </p>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                • {formatDuration(currentTime)}
              </span>
            </div>
          </div>
          
          {/* Controls with only play/pause */}
          <div className="flex items-center">
            {/* Play/Pause button */}
            <button 
              className={`w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center 
                hover:bg-orange-600 transition-all shadow-md ${isPlaying ? 'play-button-pulse' : ''}`}
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the parent onClick
                onTogglePlay(!isPlaying);
              }}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              <span className="material-icons text-xl">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AudioPlayer;
