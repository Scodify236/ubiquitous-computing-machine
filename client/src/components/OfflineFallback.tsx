import React, { useEffect, useState } from 'react';

const OfflineFallback: React.FC = () => {
  const [retryCount, setRetryCount] = useState(0);
  const [isAttemptingReconnect, setIsAttemptingReconnect] = useState(false);

  // Attempt to reconnect automatically
  useEffect(() => {
    const checkConnection = () => {
      setIsAttemptingReconnect(true);
      
      // Simple fetch to check if we're back online
      fetch('/manifest.json', { method: 'HEAD' })
        .then(() => {
          // We're back online, reload the page
          window.location.reload();
        })
        .catch(() => {
          // Still offline
          setIsAttemptingReconnect(false);
        });
    };

    // Auto retry connection every 30 seconds
    const intervalId = setInterval(checkConnection, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleManualRetry = () => {
    setRetryCount(prev => prev + 1);
    setIsAttemptingReconnect(true);
    
    // Try to reconnect
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white dark:bg-zinc-900 transition-colors duration-300">
      <div className="text-center max-w-md mx-auto">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <span className="material-icons text-7xl text-orange-500 animate-pulse">wifi_off</span>
            <div className="absolute inset-0 bg-white/10 dark:bg-black/10 rounded-full blur-xl opacity-60 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>
        
        <div className="mb-2 flex items-center justify-center">
          <span className="material-icons text-orange-500 mr-2">music_note</span>
          <h2 className="text-xl font-bold">
            <span className="text-gray-900 dark:text-white">VE</span>
            <span className="text-orange-500">LIN</span>
          </h2>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          You're Offline
        </h1>
        
        <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/50 rounded-lg p-4 mb-6">
          <p className="text-gray-700 dark:text-gray-300">
            It seems like you're not connected to the internet. VELIN works best with an active connection.
          </p>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto text-sm">
          Don't worry! Your previously loaded content and cached podcasts are still available for offline listening.
        </p>
        
        <button 
          onClick={handleManualRetry}
          disabled={isAttemptingReconnect}
          className="px-6 py-3 player-gradient-button text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-70"
        >
          {isAttemptingReconnect ? (
            <span className="flex items-center">
              <span className="material-icons animate-spin mr-2 text-sm">refresh</span>
              Reconnecting...
            </span>
          ) : (
            'Try Again'
          )}
        </button>
      </div>

      <div className="mt-16 pt-8 border-t border-gray-200 dark:border-zinc-800 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
          <span className="material-icons mr-2 text-orange-500">headphones</span>
          Offline Library
        </h2>
        
        <div className="bg-white dark:bg-zinc-800 shadow-md rounded-xl p-5 border border-gray-100 dark:border-zinc-700">
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-500 dark:text-gray-400 text-center">
              Your cached content will appear here when you've listened to podcasts.
              <br /><br />
              <span className="text-sm opacity-75">Try connecting to the internet to discover new podcasts.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineFallback;