# Cryptune: Modern Podcast Streaming Platform

## Application Overview

Cryptune is a modern podcast streaming platform that delivers an immersive audio experience with enhanced creator discovery and user interaction. The application features a responsive design for both mobile and desktop, integrates with external APIs for content, and provides a rich user experience with audio and video playback capabilities.

## Technical Architecture

### Frontend Technologies
- **React.js** with **TypeScript** for type safety and component-based development
- **Tailwind CSS** for responsive design and styling
- **Shadcn UI** components for enhanced UI elements
- **TanStack Query** for efficient data fetching and caching
- **Wouter** for lightweight client-side routing
- **React Hook Form** with **Zod** for form validation
- **Zustand** for state management

### Backend Technologies
- **Node.js** with **Express** for API handling
- **In-memory storage** for development and testing

### Progressive Web App (PWA) Features
- Offline capabilities
- Install prompts
- Service worker for caching and background sync
- Manifest for home screen installation

## Key APIs and Integrations

### Podcast API
- Base URL: `https://backendmix.vercel.app`
- Endpoints:
  - `/search?q={query}` - Search podcasts by keyword
  - `/featured` - Get featured podcasts
  - `/newest` - Get newest podcasts
  - `/audio/{videoId}` - Get audio stream for a podcast
  - `/video/{videoId}` - Get video stream for a podcast
  - `/channel/{channelId}` - Get channel information and episodes
  - `/channel/{channelId}/more/{nextPageToken}` - Get more episodes from a channel

### Authentication API
- Base URL: `https://vercel-auth-delta.vercel.app`
- Endpoints:
  - `/auth/register` - Register a new user
  - `/auth/login` - Login user
  - `/auth/status` - Check authentication status
  - `/database/check` - Check database connection

## Core Features

### Audio Player
The audio player is a central component of the application that handles playback of podcast content:

- **Features**:
  - Play/pause/seek controls
  - Progress bar with time indicators
  - Volume control
  - Sleep timer
  - Expanded fullscreen mode
  - Video mode toggle
  - Sharing capability

- **Implementation Details**:
  - Uses HTML5 `<audio>` element for audio playback
  - Uses HTML5 `<video>` element for video playback (when in video mode)
  - Synchronizes audio and video elements when both are active
  - Saves playback state in Zustand store for persistence
  - Handles timeouts for sleep timer functionality

### Video Mode
The application supports a video mode for podcasts that have accompanying video content:

- **Features**:
  - Toggle between audio-only and video+audio mode
  - Synchronized playback between audio and video
  - Automatic fetching of video stream when entering video mode
  - Visual indicators for current mode (header text, button state)

- **Implementation Details**:
  - Video streams are fetched from `https://backendmix.vercel.app/video/{videoId}`
  - Video element is muted as audio comes from the audio element
  - Video is automatically synchronized with audio timestamp
  - State persistence between sessions

### Authentication
User authentication is handled through a separate authentication API:

- **Features**:
  - User registration with email, password, name, phone
  - User login with email and password
  - Session persistence

- **Implementation Details**:
  - Uses Zustand store for authentication state management
  - Protected routes for authenticated content
  - Automatic redirection to auth page for unauthenticated users

### Search and Discovery
The application provides multiple ways to discover podcast content:

- **Features**:
  - Search by keyword
  - Featured podcasts section
  - Newest podcasts section
  - Channel view for creator-based browsing

- **Implementation Details**:
  - Search results are cached with TanStack Query
  - Featured and newest content refreshes periodically
  - Channel information includes metadata about the creator

### Sharing
The application includes sharing capabilities for both individual podcasts and the app itself:

- **Features**:
  - Share specific podcast episodes
  - Share channels
  - Share the application

- **Implementation Details**:
  - Uses the Web Share API when available
  - Falls back to clipboard copy on unsupported platforms
  - Custom share UI components

### Progressive Web App Features
The application is a Progressive Web App (PWA) with enhanced features:

- **Features**:
  - Offline access to previously loaded content
  - Application installation on supported devices
  - Background updates and update prompts
  - Responsive design for all device sizes

- **Implementation Details**:
  - Service worker manages caching and offline access
  - Manifest.json defines app installation behavior
  - Update detection using `onupdatefound` event
  - Network status detection and offline fallback UI

## State Management

### Global Stores
- **Audio Player Store**: Manages player state, including current podcast, playback status, volume, and video mode
- **Auth Store**: Manages authentication state and user information
- **Search Store**: Manages search queries and results
- **Share Store**: Manages sharing functionality and UI state

### Context Providers
- **NetworkProvider**: Provides network status information to components
- **ThemeProvider**: Manages theme preferences (light/dark mode)

## Code Organization

- `/client/src/components`: UI components
- `/client/src/components/ui`: Shadcn UI components
- `/client/src/pages`: Page components
- `/client/src/api`: API integration services
- `/client/src/hooks`: Custom React hooks
- `/client/src/contexts`: React context providers
- `/client/src/store`: State management stores
- `/client/src/types`: TypeScript type definitions
- `/client/src/lib`: Utility functions and configurations
- `/server`: Backend server code

## Performance Optimizations

- **Code Splitting**: Lazy loading of page components
- **Memoization**: UseCallback and UseMemo for performance-critical functions
- **Image Optimization**: Proper sizing and loading attributes
- **Resource Prefetching**: For common user paths
- **Service Worker Caching**: For assets and API responses

## Security Considerations

- **Input Validation**: Zod schema validation for all user inputs
- **Authentication**: Secure token-based authentication
- **API Rate Limiting**: To prevent abuse
- **Content Security**: Safe rendering of external content
- **Error Handling**: User-friendly error messages without exposing technical details