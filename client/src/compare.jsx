import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// A React component that mimics the same functionality as the SolidJS version
// for direct performance comparison
function ReactApp() {
  const [podcasts, setPodcasts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('featured');
  
  // Simulate fetching podcasts
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      // Create 100 fake podcast items for performance testing
      const fakePodcasts = Array(100).fill().map((_, i) => ({
        id: i,
        title: `Performance Test Podcast ${i + 1}`,
        description: 'This is a test podcast to demonstrate React performance',
        thumbnail: `https://picsum.photos/300/200?random=${i}`,
        duration: 1800 + (i * 60), // 30 mins + some variation
        uploaderName: 'Performance Tester',
        uploaderVerified: i % 3 === 0,
        views: 1000 + (i * 100),
        uploadedDate: new Date().toISOString()
      }));
      
      setPodcasts(fakePodcasts);
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Format duration helper
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    if (minutes < 60) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  };
  
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="material-icons text-primary text-3xl">podcasts</span>
            <h1 className="text-xl font-bold">PodFlow (React Comparison)</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2">
              <span className="material-icons">search</span>
            </button>
            <button className="p-2">
              <span className="material-icons">person</span>
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          <button 
            className={`px-4 py-2 rounded-full transition-colors ${
              currentTab === 'featured' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setCurrentTab('featured')}
          >
            Featured
          </button>
          <button 
            className={`px-4 py-2 rounded-full transition-colors ${
              currentTab === 'newest' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setCurrentTab('newest')}
          >
            Newest
          </button>
          <button 
            className={`px-4 py-2 rounded-full transition-colors ${
              currentTab === 'trending' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setCurrentTab('trending')}
          >
            Trending
          </button>
        </div>
        
        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}
        
        {/* Podcast grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {podcasts.map((podcast) => (
              <div key={podcast.id} className="bg-white dark:bg-zinc-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer">
                <div className="aspect-video relative">
                  <img 
                    src={podcast.thumbnail} 
                    alt={podcast.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(podcast.duration)}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">
                    {podcast.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>{podcast.uploaderName}</span>
                    {podcast.uploaderVerified && (
                      <span className="material-icons text-primary text-sm ml-1">verified</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Intl.NumberFormat().format(podcast.views)} views
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ReactApp />
  </React.StrictMode>
);