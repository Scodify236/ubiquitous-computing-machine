import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source and destination paths
const sourcePath = path.join(__dirname, '..', 'client', 'src', 'service-worker.js');
const destPath = path.join(__dirname, '..', 'client', 'public', 'service-worker.js');

try {
  // Read the source file
  const content = fs.readFileSync(sourcePath, 'utf-8');
  
  // Create the public directory if it doesn't exist
  const publicDir = path.join(__dirname, '..', 'client', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Write to the destination
  fs.writeFileSync(destPath, content);
  
  console.log('Service worker successfully copied to public folder!');
} catch (error) {
  console.error('Error copying service worker:', error);
}