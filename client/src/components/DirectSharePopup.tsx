import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useShareStore } from "@/lib/useShare";

const DirectSharePopup = () => {
  // Use our Zustand store directly
  const { isShareOpen, shareContent, closeShare } = useShareStore();
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  
  // Debug logs to help troubleshoot
  useEffect(() => {
    console.log("DirectSharePopup mounted");
    return () => console.log("DirectSharePopup unmounted");
  }, []);
  
  useEffect(() => {
    console.log("Share visibility changed:", { isOpen: isShareOpen, content: shareContent });
  }, [isShareOpen, shareContent]);
  
  // Handle clicking outside the popup to close it
  useEffect(() => {
    if (!isShareOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        closeShare();
      }
    };
    
    // Add a small delay to avoid immediate closing
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isShareOpen, closeShare]);
  
  // Reset copied state when dialog opens
  useEffect(() => {
    if (isShareOpen) {
      setCopied(false);
      
      // Select text in input when dialog opens
      setTimeout(() => {
        inputRef.current?.select();
      }, 100);
    }
  }, [isShareOpen]);
  
  const handleCopyLink = () => {
    if (!shareContent) return;
    if (inputRef.current) {
      inputRef.current.select();
      document.execCommand('copy');
      
      // Show visual feedback
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
        duration: 3000,
      });
      
      // Reset after a delay
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };
  
  const handleShare = (platform: 'facebook' | 'twitter' | 'whatsapp' | 'email') => {
    if (!shareContent) return;
    
    const shareText = `Check out this podcast: ${shareContent.title}`;
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareContent.url);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodedText} ${encodedUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodedText}&body=${encodedText}%0A%0A${encodedUrl}`;
        break;
    }
    
    // Open in a new tab/window
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
    
    // Close the dialog after sharing
    setTimeout(() => {
      closeShare();
    }, 300);
  };
  
  // Don't render anything if not open
  if (!isShareOpen || !shareContent) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 z-[1000] overflow-y-auto flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div 
        ref={popupRef}
        className="w-[90%] max-w-[310px] rounded-3xl overflow-hidden shadow-xl dark:bg-zinc-900/95 bg-white/95 backdrop-blur-sm m-4"
      >
        <div className="flex flex-col w-full h-full">
          {/* Header with gradient background */}
          <div className="py-4 px-5 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700">
            <div className="text-white text-lg font-medium flex items-center justify-between">
              <span>Share Content</span>
              <button 
                onClick={closeShare}
                className="text-white/80 hover:text-white rounded-full p-1 transition-colors"
              >
                <span className="material-icons text-xl">close</span>
              </button>
            </div>
          </div>
          
          <div className="p-4 flex flex-col gap-4">
            {/* Content preview with nice shadow */}
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-xl", 
              "bg-white dark:bg-zinc-800 shadow-sm"
            )}>
              {shareContent.thumbnail ? (
                <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-zinc-700">
                  <img 
                    src={shareContent.thumbnail} 
                    alt={shareContent.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Add podcast icon on error
                      const target = e.target as HTMLImageElement;
                      target.src = ''; 
                      target.style.display = 'none';
                      const parentDiv = target.parentElement;
                      if (parentDiv) {
                        parentDiv.innerHTML = '<span class="material-icons text-orange-500 flex items-center justify-center h-full">podcasts</span>';
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-orange-100 dark:bg-zinc-700 flex items-center justify-center">
                  <span className="material-icons text-orange-500">podcasts</span>
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-0.5 truncate">{shareContent.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {shareContent.type === 'podcast' ? 'Podcast' : shareContent.type === 'channel' ? 'Channel' : 'App'}
                </p>
              </div>
            </div>
            
            {/* Samsung OneUI style app grid for sharing */}
            <div className="grid grid-cols-4 gap-3 pb-2">
              {/* Facebook */}
              <button 
                onClick={() => handleShare('facebook')}
                className="flex flex-col items-center gap-1 hover:opacity-90 transition-opacity"
              >
                <div className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center">
                  <span className="material-icons text-white">facebook</span>
                </div>
                <span className="text-[10px] text-gray-700 dark:text-gray-300">Facebook</span>
              </button>
              
              {/* Twitter */}
              <button 
                onClick={() => handleShare('twitter')}
                className="flex flex-col items-center gap-1 hover:opacity-90 transition-opacity"
              >
                <div className="w-12 h-12 rounded-full bg-[#1DA1F2] flex items-center justify-center">
                  <span className="material-icons text-white">chat</span>
                </div>
                <span className="text-[10px] text-gray-700 dark:text-gray-300">Twitter</span>
              </button>
              
              {/* WhatsApp */}
              <button 
                onClick={() => handleShare('whatsapp')}
                className="flex flex-col items-center gap-1 hover:opacity-90 transition-opacity"
              >
                <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center">
                  <span className="material-icons text-white">whatsapp</span>
                </div>
                <span className="text-[10px] text-gray-700 dark:text-gray-300">WhatsApp</span>
              </button>
              
              {/* Email */}
              <button 
                onClick={() => handleShare('email')}
                className="flex flex-col items-center gap-1 hover:opacity-90 transition-opacity"
              >
                <div className="w-12 h-12 rounded-full bg-gray-500 flex items-center justify-center">
                  <span className="material-icons text-white">email</span>
                </div>
                <span className="text-[10px] text-gray-700 dark:text-gray-300">Email</span>
              </button>
            </div>
            
            {/* Copy link section - Samsung OneUI style */}
            <div className="mt-2">
              <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-lg px-3 py-2 mb-3">
                <div className="flex-1 overflow-hidden">
                  <Input
                    ref={inputRef}
                    defaultValue={shareContent.url}
                    readOnly
                    className="text-xs text-gray-600 dark:text-gray-300 bg-transparent border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <button
                  onClick={handleCopyLink}
                  className={cn(
                    "flex-shrink-0 rounded-full p-1.5 transition-colors ml-1",
                    copied ? "bg-green-500 text-white" : "bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300"  
                  )}
                >
                  <span className="material-icons text-sm">
                    {copied ? "check" : "content_copy"}
                  </span>
                </button>
              </div>
              
              <button 
                onClick={handleCopyLink}
                className={cn(
                  "w-full h-10 rounded-full text-sm font-medium flex items-center justify-center transition-colors",
                  copied 
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white"
                )}
              >
                {copied ? "Copied to clipboard" : "Copy link"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectSharePopup;