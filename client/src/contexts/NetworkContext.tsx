import React from 'react';

// Define the context type
interface NetworkContextType {
  isOnline: boolean;
}

// Create the context with a default value
export const NetworkContext = React.createContext<NetworkContextType>({ isOnline: true });

// Define the props type for the provider
interface NetworkProviderProps {
  children: React.ReactNode;
}

// Create the provider component
export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  // Initialize the online state with navigator.onLine
  const [isOnline, setIsOnline] = React.useState<boolean>(true);

  // Set up event listeners for online/offline status
  React.useEffect(() => {
    // Check if we're in a browser environment (has navigator)
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      // Set initial state correctly
      setIsOnline(navigator.onLine);

      // Event handlers
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      // Add event listeners
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Cleanup function to remove event listeners
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
    // No cleanup needed if we're not in a browser
    return undefined;
  }, []);

  // Provide the context value to children
  return (
    <NetworkContext.Provider value={{ isOnline }}>
      {children}
    </NetworkContext.Provider>
  );
};