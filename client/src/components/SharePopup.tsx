import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SharePopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  thumbnail?: string;
}

const SharePopup = ({ isOpen, onClose, title, url, thumbnail }: SharePopupProps) => {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Reset copied state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCopied(false);
    }
  }, [isOpen]);
  
  // Select text in input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen]);
  
  const handleCopyLink = () => {
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
    const shareText = `Check out this podcast: ${title}`;
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(url);
    
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
      onClose();
    }, 300);
  };
  
  // Debug logs to help troubleshoot
  console.log('SharePopup render:', { isOpen, title, url });

  useEffect(() => {
    console.log('SharePopup open state changed:', isOpen);
  }, [isOpen]);

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        console.log('Dialog onOpenChange:', open);
        if (!open) onClose();
      }}
      modal={true}
    >
      <DialogContent className="w-full sm:w-[90%] max-w-[310px] rounded-3xl overflow-hidden p-0 border-0 shadow-xl dark:bg-zinc-900/95 bg-white/95 backdrop-blur-sm">
        {/* Samsung-style UI with blurred glass effect */}
        <div className="flex flex-col w-full h-full">
          {/* Header with gradient background */}
          <div className="py-4 px-5 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700">
            <DialogTitle className="text-white text-lg font-medium flex items-center justify-between">
              <span>Share Content</span>
              <button 
                onClick={onClose}
                className="text-white/80 hover:text-white rounded-full p-1 transition-colors"
              >
                <span className="material-icons text-xl">close</span>
              </button>
            </DialogTitle>
          </div>
          
          <div className="p-4 flex flex-col gap-4">
            {/* Content preview with nice shadow */}
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-xl", 
              "bg-white dark:bg-zinc-800 shadow-sm"
            )}>
              {thumbnail ? (
                <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-zinc-700">
                  <img 
                    src={thumbnail} 
                    alt={title} 
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
                <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-0.5 truncate">{title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Podcast</p>
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
              
              {/* Messages */}
              <button 
                className="flex flex-col items-center gap-1 hover:opacity-90 transition-opacity"
              >
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="material-icons text-white">message</span>
                </div>
                <span className="text-[10px] text-gray-700 dark:text-gray-300">Messages</span>
              </button>
              
              {/* Bluetooth */}
              <button 
                className="flex flex-col items-center gap-1 hover:opacity-90 transition-opacity"
              >
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="material-icons text-white">bluetooth</span>
                </div>
                <span className="text-[10px] text-gray-700 dark:text-gray-300">Bluetooth</span>
              </button>
              
              {/* Notes */}
              <button 
                className="flex flex-col items-center gap-1 hover:opacity-90 transition-opacity"
              >
                <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center">
                  <span className="material-icons text-white">edit_note</span>
                </div>
                <span className="text-[10px] text-gray-700 dark:text-gray-300">Notes</span>
              </button>
              
              {/* More */}
              <button 
                className="flex flex-col items-center gap-1 hover:opacity-90 transition-opacity"
              >
                <div className="w-12 h-12 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center">
                  <span className="material-icons text-white">more_horiz</span>
                </div>
                <span className="text-[10px] text-gray-700 dark:text-gray-300">More</span>
              </button>
            </div>
            
            {/* Copy link section - Samsung OneUI style */}
            <div className="mt-2">
              <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-lg px-3 py-2 mb-3">
                <div className="flex-1 overflow-hidden">
                  <Input
                    ref={inputRef}
                    defaultValue={url}
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
      </DialogContent>
    </Dialog>
  );
};

export default SharePopup;