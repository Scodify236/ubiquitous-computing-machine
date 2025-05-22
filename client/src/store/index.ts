import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Podcast, AudioStream, VideoStream } from '@/types/podcast';

interface AudioPlayerState {
  currentPodcast: Podcast | null;
  audioStream: AudioStream | null;
  videoStream: VideoStream | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  isExpanded: boolean;
  isVideoMode: boolean; // Flag to indicate if video mode is active
  sleepTimer: number | null; // Time in minutes for sleep timer
  sleepTimerEndTime: number | null; // Timestamp when sleep timer will end
  setCurrentPodcast: (podcast: Podcast | null) => void;
  setAudioStream: (stream: AudioStream | null) => void;
  setVideoStream: (stream: VideoStream | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  toggleExpanded: () => void;
  toggleVideoMode: () => void; // Toggle between video and audio mode
  setSleepTimer: (minutes: number | null) => void;
  clearSleepTimer: () => void;
}

export const useAudioPlayerStore = create<AudioPlayerState>((set) => ({
  currentPodcast: null,
  audioStream: null,
  videoStream: null,
  isPlaying: false,
  volume: 1,
  isMuted: false,
  currentTime: 0,
  duration: 0,
  isExpanded: false,
  isVideoMode: false,
  sleepTimer: null,
  sleepTimerEndTime: null,
  setCurrentPodcast: (podcast) => set({ currentPodcast: podcast }),
  setAudioStream: (stream) => set({ audioStream: stream }),
  setVideoStream: (stream) => set({ videoStream: stream }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setVolume: (volume) => set({ volume }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),
  toggleVideoMode: () => set((state) => ({ isVideoMode: !state.isVideoMode })),
  setSleepTimer: (minutes) => set(() => {
    if (minutes === null) {
      return { sleepTimer: null, sleepTimerEndTime: null };
    }
    
    const endTime = Date.now() + minutes * 60 * 1000;
    return { sleepTimer: minutes, sleepTimerEndTime: endTime };
  }),
  clearSleepTimer: () => set({ sleepTimer: null, sleepTimerEndTime: null }),
}));

interface SearchState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));

// User authentication state
interface User {
  email: string;
  name?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Using persist middleware to keep user logged in after page refresh
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false, // Require proper authentication
      isLoading: false,
      error: null,
      login: (user) => set({ user, isAuthenticated: true, error: null }),
      logout: () => set({ user: null, isAuthenticated: false }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'podcast-auth-storage', // Name for localStorage
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
