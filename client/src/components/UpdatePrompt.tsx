import React, { useState, useEffect } from 'react';

interface UpdatePromptProps {
  // Optional callback function when users accept the update
  onAcceptUpdate?: () => void;
}

/**
 * A component that shows a prompt when a new version of the PWA is available
 */
const UpdatePrompt: React.FC<UpdatePromptProps> = ({ onAcceptUpdate }) => {
  const [newServiceWorkerDetected, setNewServiceWorkerDetected] = useState<boolean>(false);
  const [waitingServiceWorker, setWaitingServiceWorker] = useState<ServiceWorker | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Add event listeners for service worker updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker controller changed - page will reload');
        // When the service worker controller changes, it means the page is now 
        // controlled by the new service worker
        if (isUpdating) {
          // Don't reload twice (avoid infinite reload loop)
          return;
        }
        setIsUpdating(true);
        // Reload the page so it's under the control of the new service worker
        window.location.reload();
      });
      
      // Watch for new service worker registration
      navigator.serviceWorker.getRegistration().then(registration => {
        if (!registration) return;
        
        // When a new service worker is waiting
        if (registration.waiting) {
          setNewServiceWorkerDetected(true);
          setWaitingServiceWorker(registration.waiting);
        }
        
        // Listen for new service worker installation
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          if (!newWorker) return;
          
          // Listen for state changes on the new service worker
          newWorker.addEventListener('statechange', () => {
            // When the service worker is installed and waiting
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New service worker is waiting to activate');
              setNewServiceWorkerDetected(true);
              setWaitingServiceWorker(newWorker);
            }
          });
        });
      });
    }
  }, [isUpdating]);
  
  // Function to tell the waiting service worker to take control
  const updateServiceWorker = () => {
    if (!waitingServiceWorker) return;
    
    setIsUpdating(true);
    
    // Send a message to the service worker to skip waiting
    waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
  };
  
  // If no update is available, don't render anything
  if (!newServiceWorkerDetected) {
    return null;
  }
  
  return (
    <div className="fixed left-0 right-0 top-16 mx-auto z-50 max-w-md animate-fade-in-up">
      <div className="m-4 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 overflow-hidden">
        <div className="p-4 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/30 flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            <span className="material-icons text-orange-500 text-xl">system_update</span>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">
              Update Available
            </h3>
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              <p>A new version of VELIN is available!</p>
            </div>
            <div className="mt-4 flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  updateServiceWorker();
                  if (onAcceptUpdate) onAcceptUpdate();
                }}
                disabled={isUpdating}
                className="inline-flex items-center rounded-md bg-orange-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:opacity-50"
              >
                {isUpdating ? (
                  <>
                    <span className="material-icons animate-spin mr-1.5 text-sm">refresh</span>
                    Updating...
                  </>
                ) : (
                  <>
                    <span className="material-icons mr-1.5 text-sm">download</span>
                    Update Now
                  </>
                )}
              </button>
              {!isUpdating && (
                <button
                  type="button"
                  onClick={() => setNewServiceWorkerDetected(false)}
                  className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-zinc-700 dark:text-gray-100 dark:ring-zinc-600 dark:hover:bg-zinc-600"
                >
                  Maybe Later
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePrompt;