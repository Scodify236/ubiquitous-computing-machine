import { useEffect, useState } from "react";
import { useShare } from "@/lib/useShare";
import SharePopup from "./SharePopup";

interface LocalShareContent {
  title: string;
  url: string;
  thumbnail?: string;
}

const GlobalSharePopup = () => {
  // Get the share state from the global hook
  const { isShareOpen, shareContent, closeShare } = useShare();
  
  // Local state to ensure the component is always rendered
  const [showPopup, setShowPopup] = useState(false);
  const [localContent, setLocalContent] = useState<LocalShareContent>({
    title: 'Velin',
    url: window.location.origin
  });
  
  // Listen for changes to the global share state
  useEffect(() => {
    console.log("Share state changed:", { isShareOpen, content: shareContent });
    
    if (isShareOpen && shareContent) {
      setShowPopup(true);
      setLocalContent({
        title: shareContent.title,
        url: shareContent.url,
        thumbnail: shareContent.thumbnail
      });
    }
  }, [isShareOpen, shareContent]);

  return (
    <SharePopup
      isOpen={isShareOpen}
      onClose={closeShare}
      title={localContent.title}
      url={localContent.url || window.location.origin}
      thumbnail={localContent.thumbnail}
    />
  );
};

export default GlobalSharePopup;