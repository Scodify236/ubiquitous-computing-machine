# Podcast Heaven

A modern podcast streaming platform that delivers an immersive audio experience with enhanced user interaction and personalized podcast discovery.

![Podcast Heaven](./generated-icon.png)

## Features

- 🎧 Stream podcasts with a YouTube-like interface
- 🌗 Dark/Light mode with elegant theming
- 🔍 Search and discover podcasts
- 🔐 User authentication system
- 📱 Responsive design (mobile, tablet, desktop)
- ⏱️ Sleep timer for automatic pause
- 🔄 Expandable player with controls
- 👤 User profiles and personalization
- 📢 Share podcasts with others

## Technologies Used

- React + TypeScript for frontend
- Express.js backend
- Tailwind CSS for styling
- Shadcn/UI component library
- Zustand for state management
- React Query for data fetching
- Drizzle ORM for database integration
- Zod for validation

## API Credits

This application integrates with the following APIs:

- **Podcast Heaven API**: Powers the podcast discovery and streaming capabilities
- **Authentication API**: Provides secure user authentication services

These APIs are third-party services that enable the core functionality of this application. All rights belong to their respective owners.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
client/            # Frontend React application
├── src/
│   ├── api/       # API integration
│   ├── components/# UI components
│   ├── hooks/     # Custom React hooks
│   ├── lib/       # Utility functions
│   ├── pages/     # Page components
│   ├── store/     # State management
│   └── types/     # TypeScript types
│
server/            # Backend Express server
shared/            # Shared code between client and server
```

## License

All rights reserved.

## Acknowledgements

- Design inspired by modern streaming platforms and Samsung OneUI
- Icon and design elements created for Podcast Heaven