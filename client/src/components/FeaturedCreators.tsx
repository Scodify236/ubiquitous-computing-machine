import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import LoadingIndicator from '@/components/LoadingIndicator';

// Define the interface for creator data
interface CreatorData {
  name: string;
  avatarUrl: string;
  subscriberCount: string;
  verified: boolean;
}

// Interface for channel data from the API
interface ChannelsData {
  [channelId: string]: CreatorData;
}

// Creator object with processed data
interface Creator {
  id: string;
  name: string;
  avatarUrl: string;
  url: string;
  subscribers: string;
  verified: boolean;
}

// Function to fetch channel data from URL
const fetchChannelData = async (): Promise<ChannelsData> => {
  const response = await fetch('https://raw.githubusercontent.com/Shashwat-CODING/ytdlp-api/refs/heads/main/channels.json');
  
  if (!response.ok) {
    throw new Error('Failed to fetch channel data');
  }
  
  return response.json();
};

// Convert the channel data to our featured creators format
const processChannelData = (channelsData: ChannelsData): Creator[] => {
  return Object.entries(channelsData).map(([id, data]) => ({
    id,
    name: data.name,
    avatarUrl: data.avatarUrl,
    url: `/channel/${id}`,
    subscribers: data.subscriberCount,
    verified: data.verified
  }));
};

const FeaturedCreators: React.FC = () => {
  // Use TanStack Query to fetch and cache data
  const { isLoading, error, data } = useQuery({
    queryKey: ['featured-creators'],
    queryFn: fetchChannelData,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 2
  });

  // Process data when available
  const featuredCreators = data ? processChannelData(data) : [];

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-800 dark:text-white">
        <span className="material-icons text-orange-500 mr-2">verified</span>
        Featured Creators
      </h2>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingIndicator text="Loading creators..." />
        </div>
      ) : error ? (
        <div className="text-center py-4 text-red-500">
          <p>Failed to load featured creators</p>
        </div>
      ) : (
        <div className="overflow-x-auto hide-scrollbar pb-6">
          <div className="flex space-x-6">
            {featuredCreators.map((creator) => (
              <div key={creator.id} className="flex flex-col items-center group cursor-pointer" onClick={() => window.location.pathname = creator.url}>
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-orange-500 p-0.5 flex-shrink-0 hover:scale-105 transition-transform relative shadow-lg">
                  <img 
                    src={creator.avatarUrl} 
                    alt={creator.name}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.name.substring(0, 2))}&background=random&size=200`;
                    }}
                    loading="lazy"
                  />
                  {creator.verified && (
                    <span className="absolute bottom-0 right-0 bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transform translate-x-1 translate-y-1 shadow-md">
                      <span className="material-icons text-[14px]">verified</span>
                    </span>
                  )}
                </div>
                <span className="mt-2 text-sm md:text-base font-medium text-center max-w-[100px] truncate">{creator.name}</span>
                {creator.subscribers && (
                  <span className="text-xs text-gray-500 group-hover:text-orange-500 transition-colors mt-1">
                    {creator.subscribers} subscribers
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedCreators;