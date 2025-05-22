import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Running post-build tasks...');

// Define source and destination paths for create.html
const sourceCreateHtml = path.join(__dirname, '..', 'client', 'public', 'create.html');
const destCreateHtml = path.join(__dirname, '..', 'dist', 'client', 'create.html');

// Ensure destination directory exists
const destDir = path.join(__dirname, '..', 'dist', 'client');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  console.log(`Created directory: ${destDir}`);
}

// Copy create.html
if (fs.existsSync(sourceCreateHtml)) {
  try {
    fs.copyFileSync(sourceCreateHtml, destCreateHtml);
    console.log(`Successfully copied: create.html to ${destCreateHtml}`);
  } catch (error) {
    console.error('Error copying create.html:', error);
  }
} else {
  console.warn(`Source file not found: ${sourceCreateHtml}`);
}

// Additionally, let's make sure the service worker files are copied correctly
const sourceServiceWorker = path.join(__dirname, '..', 'client', 'public', 'service-worker.js');
const destServiceWorker = path.join(__dirname, '..', 'dist', 'client', 'service-worker.js');

if (fs.existsSync(sourceServiceWorker)) {
  try {
    fs.copyFileSync(sourceServiceWorker, destServiceWorker);
    console.log(`Successfully copied: service-worker.js to ${destServiceWorker}`);
  } catch (error) {
    console.error('Error copying service-worker.js:', error);
  }
} else {
  console.warn(`Source file not found: ${sourceServiceWorker}`);
}

console.log('Post-build tasks completed!');