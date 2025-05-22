import { RefObject, useCallback } from "react";

interface UseAudioPlayerProps {
  audioRef: RefObject<HTMLAudioElement>;
  progressBarRef: RefObject<HTMLDivElement>;
  volumeSliderRef: RefObject<HTMLDivElement>;
  expandedProgressBarRef: RefObject<HTMLInputElement | HTMLDivElement>;
  isPlaying: boolean;
  onTogglePlay: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  volume: number;
  setVolume: (volume: number) => void;
  isMuted: boolean;
}

export const useAudioPlayer = ({
  audioRef,
  progressBarRef,
  volumeSliderRef,
  expandedProgressBarRef,
  setCurrentTime,
  setDuration,
  volume,
  setVolume,
  isMuted
}: UseAudioPlayerProps) => {
  
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, [audioRef, setCurrentTime]);
  
  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      
      // Set initial volume
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [audioRef, setDuration, volume, isMuted]);
  
  // Generic progress bar click handler that works with any element type
  const handleProgressBarClick = useCallback((e: React.MouseEvent<Element>) => {
    if (progressBarRef.current && audioRef.current && !isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const newTime = pos * audioRef.current.duration;
      const safeTime = Math.max(0, Math.min(newTime, audioRef.current.duration));
      
      if (!isNaN(safeTime) && isFinite(safeTime)) {
        audioRef.current.currentTime = safeTime;
        setCurrentTime(safeTime);
      }
    }
  }, [progressBarRef, audioRef, setCurrentTime]);
  
  // Generic expanded progress bar click handler
  const handleExpandedProgressBarClick = useCallback((e: React.MouseEvent<Element>) => {
    if (expandedProgressBarRef.current && audioRef.current && !isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
      const rect = expandedProgressBarRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const newTime = pos * audioRef.current.duration;
      const safeTime = Math.max(0, Math.min(newTime, audioRef.current.duration));
      
      if (!isNaN(safeTime) && isFinite(safeTime)) {
        audioRef.current.currentTime = safeTime;
        setCurrentTime(safeTime);
      }
    }
  }, [expandedProgressBarRef, audioRef, setCurrentTime]);
  
  // Handle range input direct change
  const handleRangeChange = useCallback((value: number) => {
    if (audioRef.current && !isNaN(value) && isFinite(value)) {
      // Ensure value is within valid range
      const safeValue = Math.max(0, Math.min(value, audioRef.current.duration || 0));
      if (!isNaN(safeValue) && isFinite(safeValue)) {
        audioRef.current.currentTime = safeValue;
        setCurrentTime(safeValue);
      }
    }
  }, [audioRef, setCurrentTime]);
  
  // Handle volume change from range input
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (audioRef.current) {
      setVolume(newVolume);
      audioRef.current.volume = isMuted ? 0 : newVolume;
    }
  }, [audioRef, setVolume, isMuted]);
  
  return {
    handleTimeUpdate,
    handleLoadedMetadata,
    handleProgressBarClick,
    handleExpandedProgressBarClick,
    handleRangeChange,
    handleVolumeChange
  };
};
