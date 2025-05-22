import fs from 'fs';
import path from 'path';
import { createCanvas } from 'canvas';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create directory if it doesn't exist
const publicDir = path.join(__dirname, '..', 'client', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Function to create an icon
function createIcon(size, isMaskable = false) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#ff7b00'; // Cryptune orange
  
  if (isMaskable) {
    // For maskable icons, we need safe area padding (usually 10%)
    const safeAreaInset = size * 0.1;
    ctx.fillRect(0, 0, size, size);
    
    // Draw a rounded rectangle for the icon
    const rectSize = size - (safeAreaInset * 2);
    const cornerRadius = rectSize / 4;
    
    ctx.beginPath();
    ctx.moveTo(safeAreaInset + cornerRadius, safeAreaInset);
    ctx.lineTo(safeAreaInset + rectSize - cornerRadius, safeAreaInset);
    ctx.arcTo(safeAreaInset + rectSize, safeAreaInset, safeAreaInset + rectSize, safeAreaInset + cornerRadius, cornerRadius);
    ctx.lineTo(safeAreaInset + rectSize, safeAreaInset + rectSize - cornerRadius);
    ctx.arcTo(safeAreaInset + rectSize, safeAreaInset + rectSize, safeAreaInset + rectSize - cornerRadius, safeAreaInset + rectSize, cornerRadius);
    ctx.lineTo(safeAreaInset + cornerRadius, safeAreaInset + rectSize);
    ctx.arcTo(safeAreaInset, safeAreaInset + rectSize, safeAreaInset, safeAreaInset + rectSize - cornerRadius, cornerRadius);
    ctx.lineTo(safeAreaInset, safeAreaInset + cornerRadius);
    ctx.arcTo(safeAreaInset, safeAreaInset, safeAreaInset + cornerRadius, safeAreaInset, cornerRadius);
    ctx.closePath();
  } else {
    // For regular icons, use the full canvas with rounded corners
    const cornerRadius = size / 4;
    
    ctx.beginPath();
    ctx.moveTo(cornerRadius, 0);
    ctx.lineTo(size - cornerRadius, 0);
    ctx.arcTo(size, 0, size, cornerRadius, cornerRadius);
    ctx.lineTo(size, size - cornerRadius);
    ctx.arcTo(size, size, size - cornerRadius, size, cornerRadius);
    ctx.lineTo(cornerRadius, size);
    ctx.arcTo(0, size, 0, size - cornerRadius, cornerRadius);
    ctx.lineTo(0, cornerRadius);
    ctx.arcTo(0, 0, cornerRadius, 0, cornerRadius);
    ctx.closePath();
  }
  
  ctx.fill();
  
  // Draw the podcast play icon 
  ctx.fillStyle = 'white';
  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = size * 0.35;
  const innerRadius = size * 0.25;
  const dotRadius = size * 0.07;
  
  // Draw outer circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
  ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI, true);
  ctx.fill();
  
  // Draw inner dot
  ctx.beginPath();
  ctx.arc(centerX + innerRadius / 2, centerY, dotRadius, 0, 2 * Math.PI);
  ctx.fill();
  
  return canvas.toBuffer('image/png');
}

// Create standard icons
const icons = [
  { name: 'logo192.png', size: 192 },
  { name: 'logo512.png', size: 512 }, 
  { name: 'maskable_icon.png', size: 192, maskable: true }
];

icons.forEach(icon => {
  const buffer = createIcon(icon.size, icon.maskable);
  fs.writeFileSync(path.join(publicDir, icon.name), buffer);
  console.log(`Created ${icon.name}`);
});

// Also create a favicon
const faviconBuffer = createIcon(64);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), faviconBuffer);
console.log('Created favicon.ico');

console.log('All PWA icons generated successfully!');