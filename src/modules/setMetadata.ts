import { actionsMenu, author, img, title } from "../lib/dom";
import { generateImageUrl } from "../lib/imageUtils";
import { store } from "../lib/store";
import { hostResolver } from "../lib/utils";

let more = () => undefined;

document.getElementById('moreBtn')!.addEventListener('click', () => more());

export async function setMetaData(data: CollectionItem) {
  // Remove ' - Topic' from author name if it exists
  store.stream = data;

  let music = '';
  let authorText = store.stream.author;
  if (data.author.endsWith(' - Topic')) {
    music = '&w=720&h=720&fit=cover';
    authorText = data.author.slice(0, -8);
  }

  const metadataObj: MediaMetadataInit = {
    title: data.title,
    artist: authorText,
  };

  const imgX = generateImageUrl(data.id, 'maxres', music);
  if (store.loadImage !== 'off') {
    img.src = imgX;
    metadataObj.artwork = [
      { src: img.src, sizes: '96x96' },
      { src: img.src, sizes: '128x128' },
      { src: img.src, sizes: '192x192' },
      { src: img.src, sizes: '256x256' },
      { src: img.src, sizes: '384x384' },
      { src: img.src, sizes: '512x512' },
    ];
    img.alt = data.title;
  }

  title.href = hostResolver(`/watch?v=${data.id}`);
  title.textContent = data.title;

  author.textContent = authorText;

  more = function() {
    store.actionsMenu = data;
    actionsMenu.showModal();
    history.pushState({}, '', '#');
  };

  // Add share button functionality
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const videoId = store.stream.id; // Get the video ID from store.stream
      const shareUrl = `https://shcloud.netlify.app/?s=${videoId}`; // Create the share URL

      // Check if the Web Share API is supported
      if (navigator.share) {
        navigator.share({
          title: data.title,
          text: `Check out this video: ${data.title}`,
          url: shareUrl,
        })
        .then(() => console.log('Shared successfully'))  // Log success
        .catch(err => console.error('Share failed:', err));  // Log any errors
      } else {
        alert('Web Share API is not supported on this device.');
      }
    });
  }

  // Set page title and metadata for sharing
  if (location.pathname === '/')
    document.title = data.title + ' - Raag';

  if ('mediaSession' in navigator) {
    navigator.mediaSession.setPositionState();
    navigator.mediaSession.metadata = new MediaMetadata(metadataObj);
  }
}
