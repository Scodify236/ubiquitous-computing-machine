import { create } from 'zustand';
import { Podcast } from '@/types/podcast';

export interface ShareContent {
  title: string;
  url: string;
  thumbnail?: string;
  type?: 'podcast' | 'app' | 'channel';
}

// Create a Zustand store for global share state management
interface ShareStore {
  isShareOpen: boolean;
  shareContent: ShareContent | null;
  openShare: (content: ShareContent) => void;
  closeShare: () => void;
  sharePodcast: (podcast: Podcast) => void;
  shareApp: () => void;
  shareChannel: (channelName: string, channelId: string, channelImage?: string) => void;
}

// This gives us a global store that's consistent across components
export const useShareStore = create<ShareStore>((set, get) => ({
  isShareOpen: false,
  shareContent: null,
  
  openShare: (content: ShareContent) => {
    console.log('Opening share dialog with:', content);
    // Update both state values at once to prevent race conditions
    set({ 
      isShareOpen: true,
      shareContent: content 
    });
    // Log for debugging
    setTimeout(() => {
      const state = get();
      console.log('Share dialog state after update:', { 
        isOpen: state.isShareOpen, 
        content: state.shareContent 
      });
    }, 50);
  },
  
  closeShare: () => {
    set({ isShareOpen: false });
    // Reset content after a delay
    setTimeout(() => {
      set({ shareContent: null });
    }, 300);
  },
  
  sharePodcast: (podcast: Podcast) => {
    // Generate a shareable URL for the podcast
    const videoId = podcast.url.split('v=')[1]?.split('&')[0] || '';
    if (!videoId) return;
    
    // Create a shareable URL
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}?share=${videoId}`;
    
    // Use our own getter to get the openShare method
    get().openShare({
      title: podcast.title,
      url: shareUrl,
      thumbnail: podcast.thumbnail,
      type: 'podcast'
    });
  },
  
  shareApp: () => {
    get().openShare({
      title: 'Velin',
      url: window.location.origin,
      type: 'app'
    });
  },
  
  shareChannel: (channelName: string, channelId: string, channelImage?: string) => {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/channel/${channelId}`;
    
    get().openShare({
      title: channelName,
      url: shareUrl,
      thumbnail: channelImage,
      type: 'channel'
    });
  }
}));

// Export a hook for compatibility with existing code
export function useShare() {
  const shareStore = useShareStore();
  return shareStore;
}