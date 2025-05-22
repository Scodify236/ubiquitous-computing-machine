import { useLocation } from "wouter";
import { Podcast } from "@/types/podcast";
import { extractVideoIdFromUrl, formatDuration, formatViews, getYouTubeThumbnail } from "@/api/podcast";
import React, { memo, useCallback, useState, useRef, useEffect, useMemo } from "react";

interface PodcastCardProps {
  podcast: Podcast;
  onClick?: () => void;
  compact?: boolean;
  priority?: boolean;
}

// Cache for already loaded images to prevent unnecessary reloads
const loadedImages = new Set<string>();

const PodcastCard = memo(({ podcast, onClick, compact = false, priority = false }: PodcastCardProps) => {
  const [, setLocation] = useLocation();
  const [imageLoaded, setImageLoaded] = useState(() => {
    // Check if the image was already loaded previously
    const videoId = extractVideoIdFromUrl(podcast.url);
    return loadedImages.has(videoId || '');
  });
  const [imageError, setImageError] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Get video ID once and store it
  const videoId = extractVideoIdFromUrl(podcast.url);
  
  // Handle navigation to podcast detail
  const handleClick = useCallback((e: React.MouseEvent) => {
    // For better performance, prevent default and use programmatic navigation
    e.preventDefault();
    
    if (onClick) {
      onClick();
    } else if (videoId) {
      setLocation(`/podcast/${videoId}`);
    }
  }, [onClick, videoId, setLocation]);
  
  // Thumbnail loading handlers - optimized
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    if (videoId) {
      loadedImages.add(videoId);
    }
  }, [videoId]);
  
  const handleImageError = useCallback(() => {
    setImageError(true);
    
    // Fallback to the original thumbnail from API
    if (imageRef.current) {
      imageRef.current.src = podcast.thumbnail;
    }
  }, [podcast.thumbnail]);
  
  // Only update thumbnail src when needed - performance optimization
  const thumbnailSrc = useMemo(() => {
    return getYouTubeThumbnail(podcast.url, 'medium');
  }, [podcast.url]);
  
  // Use IntersectionObserver for lazy loading
  useEffect(() => {
    // If the image is already loaded or has priority, skip the observer
    if (imageLoaded || priority || !imageRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && imageRef.current) {
            // Only set the src when the element is in view
            if (!imageRef.current.src) {
              imageRef.current.src = thumbnailSrc;
            }
            observer.unobserve(imageRef.current);
          }
        });
      },
      { rootMargin: '200px' } // Load when within 200px of viewport
    );
    
    observer.observe(imageRef.current);
    
    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, [imageLoaded, priority, thumbnailSrc]);
  
  return (
    <article 
      className={`group bg-transparent w-full cursor-pointer transition-transform hover:scale-[1.02] duration-200 will-change-transform ${
        compact ? 'flex gap-4' : ''
      }`}
      onClick={handleClick}
    >
      {/* Thumbnail container with aspect ratio */}
      <div className={`relative ${compact ? 'w-32 h-20 flex-shrink-0' : 'pb-[56.25%] mb-3'} rounded-xl overflow-hidden shadow-md`}>
        {/* Native loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-zinc-800 animate-pulse"></div>
        )}
        
        {/* YouTube style thumbnail with optimized loading */}
        <img 
          ref={imageRef}
          src={priority ? thumbnailSrc : (imageLoaded ? thumbnailSrc : '')} 
          alt=""
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          width={compact ? 128 : 320}
          height={compact ? 80 : 180}
          className={`absolute w-full h-full object-cover transform transition-opacity duration-200 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
          {formatDuration(podcast.duration)}
        </div>
        
        {/* Watch Later button - only shown on hover */}
        {!compact && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              className="w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black/80"
              aria-label="Save for later"
              onClick={(e) => {
                e.stopPropagation();
                // Future functionality: Add to watch later
              }}
            >
              <span className="material-icons text-sm">bookmark_add</span>
            </button>
          </div>
        )}
        
        {/* Play button overlay - optimization: only render on hover with CSS */}
        <div 
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 group-hover:bg-black/20 transition-all duration-300"
          aria-hidden="true"
        >
          <div className="w-12 h-12 rounded-full bg-orange-500/90 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
            <span className="material-icons text-2xl">play_arrow</span>
          </div>
        </div>
      </div>
      
      {/* Content area - simplified for better performance */}
      <div className={compact ? 'flex-1 min-w-0' : 'flex'}>
        {!compact && podcast.uploaderAvatar && (
          /* Channel avatar - only in full mode and only if available */
          <div className="w-9 h-9 flex-shrink-0 mr-3 mt-0.5 rounded-full overflow-hidden bg-gray-200 dark:bg-zinc-800">
            <img 
              src={podcast.uploaderAvatar} 
              alt=""
              width={36}
              height={36}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        
        <div className={`${compact ? '' : 'flex-1 min-w-0'}`}>
          {/* Title - using native HTML with CSS limiting lines */}
          <h3 className={`font-medium ${compact ? 'text-sm line-clamp-1' : 'text-base line-clamp-2'} text-gray-900 dark:text-white mb-1`}>
            {podcast.title}
          </h3>
          
          {/* Channel info */}
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 truncate">
            <span className="truncate">{podcast.uploaderName}</span>
            {podcast.uploaderVerified && (
              <span className="material-icons text-orange-500 text-xs ml-1">verified</span>
            )}
          </div>
          
          {/* Stats - using semantic HTML */}
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">
            <span>{formatViews(podcast.views)} views</span>
            <span className="mx-1 opacity-60">•</span>
            <time dateTime={podcast.uploadedDate} className="whitespace-nowrap">
              {podcast.uploadedDate}
            </time>
          </div>
        </div>
        
        {/* Options menu - only rendered when needed */}
        {!compact && (
          <div className="relative ml-1">
            <button 
              className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
              aria-label="More options"
              onClick={(e) => {
                e.stopPropagation();
                // Future functionality
              }}
            >
              <span className="material-icons text-gray-700 dark:text-gray-300">more_vert</span>
            </button>
          </div>
        )}
      </div>
    </article>
  );
});

export default PodcastCard;
