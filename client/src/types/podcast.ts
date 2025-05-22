export interface Podcast {
  type: string;
  url: string;
  title: string;
  thumbnail: string;
  uploaderName: string;
  uploaderUrl: string;
  uploadedDate: string;
  duration: number;
  views: number;
  uploaderVerified: boolean;
  shortDescription: string;
  uploaded: number;
  uploaderAvatar: string | null;
  isShort: boolean;
  thumbnailOptions?: string[]; // Optional array of alternative thumbnail URLs for fallback
}

export interface AudioStream {
  url: string;
  quality: string;
  mimeType: string;
  codec: string;
  bitrate: number;
  contentLength: number;
  audioQuality: string;
}

export interface VideoStream {
  url: string;
  quality: string;
  mimeType: string;
  codec: string;
  bitrate: number;
  contentLength: number;
  videoQuality: string;
  height: number;
  width: number;
}

export interface StreamResponse {
  title: string;
  uploader: string;
  uploaderUrl: string | null;
  duration: number;
  audioStreams: AudioStream[];
  videoStreams?: VideoStream[];
}

export interface SearchResponse {
  items: Podcast[];
  message: string;
  code: string;
  nextpage?: string;
}

export interface FeaturedResponse {
  items: Podcast[];
  totalItems: number;
  message: string;
  code: string;
}

export interface NewestResponse {
  items: Podcast[];
  totalItems: number;
  message: string;
  code: string;
}

export interface Channel {
  name: string;
  description: string;
  subscribers: string;
  avatarUrl: string;
  bannerUrl: string;
  relatedStreams: Podcast[];
  nextpage?: string;
}

export interface ChannelResponse extends Channel {
  // Channel response extends the Channel interface
  // Could include additional properties from the API
  nextpage?: string;
}
