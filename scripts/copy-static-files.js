import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define source and destination paths
const sourceDir = path.join(__dirname, '..', 'client', 'public');
const destDir = path.join(__dirname, '..', 'dist', 'client');
const specialFiles = ['create.html'];

// Ensure destination directory exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  console.log(`Created directory: ${destDir}`);
}

// Copy special files
for (const file of specialFiles) {
  const sourcePath = path.join(sourceDir, file);
  const destPath = path.join(destDir, file);
  
  if (fs.existsSync(sourcePath)) {
    try {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Successfully copied: ${file} to build folder`);
    } catch (error) {
      console.error(`Error copying ${file}:`, error);
    }
  } else {
    console.warn(`Source file not found: ${sourcePath}`);
  }
}

console.log('Static file copying completed!');