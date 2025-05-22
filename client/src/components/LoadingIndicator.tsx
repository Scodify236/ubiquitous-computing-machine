interface LoadingIndicatorProps {
  fullScreen?: boolean;
  text?: string;
}

const LoadingIndicator = ({ fullScreen = false, text = 'Loading...' }: LoadingIndicatorProps) => {
  // Inner content (the bouncing dots and text)
  const loadingContent = (
    <>
      <div className="relative">
        {/* Modern pulse loader with 3 dots */}
        <div className="flex space-x-3 justify-center items-center h-8">
          <div className="h-3 w-3 bg-primary rounded-full animate-pulse" 
               style={{ animationDelay: '0ms', animationDuration: '800ms' }}></div>
          <div className="h-3 w-3 bg-primary/80 rounded-full animate-pulse" 
               style={{ animationDelay: '250ms', animationDuration: '800ms' }}></div>
          <div className="h-3 w-3 bg-primary/60 rounded-full animate-pulse" 
               style={{ animationDelay: '500ms', animationDuration: '800ms' }}></div>
        </div>
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 to-transparent dark:from-primary/5 dark:to-transparent rounded-full blur-xl -z-10"></div>
      </div>
      {text && <p className="text-muted-foreground text-sm font-medium mt-2">{text}</p>}
    </>
  );
  
  return fullScreen ? (
    // Modal fullscreen version
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white/95 dark:bg-zinc-900/95 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border border-gray-100 dark:border-gray-800 min-w-[180px] animate-in fade-in duration-300">
        {loadingContent}
      </div>
    </div>
  ) : (
    // Inline version for section loading
    <div className="flex flex-col items-center justify-center p-4 gap-2">
      {loadingContent}
    </div>
  );
};

export default LoadingIndicator;
