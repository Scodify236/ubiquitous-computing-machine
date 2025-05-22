import React from 'react';
import { useLocation } from 'wouter';

const CreatePage: React.FC = () => {
  const [, navigate] = useLocation();

  return (
    <main className="flex-grow pb-24 bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-6">
          <button 
            className="flex items-center text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
            onClick={() => navigate('/')}
          >
            <span className="material-icons mr-1">arrow_back</span>
            Back to Home
          </button>
        </div>
      
        {/* Upcoming feature section */}
        <div className="bg-zinc-900 rounded-xl shadow-lg overflow-hidden border border-zinc-800 mb-8">
          <div className="relative h-32 md:h-64 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-500 opacity-40"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-md">Creator Studio</h1>
              <div className="flex items-center">
                <span className="bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  COMING SOON
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-6 md:p-8">
            <p className="text-gray-300 mb-6 leading-relaxed">
              We're excited to announce that VELIN Creator Studio is currently in development! 
              Soon, you'll be able to create and manage your own podcast content directly within the app.
            </p>
            
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="material-icons text-orange-500 mr-2">stars</span>
              Upcoming Features
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <FeatureCard 
                icon="mic"
                title="Podcast Recording" 
                description="Record high-quality audio directly in your browser with noise cancellation and audio enhancement"
              />
              <FeatureCard 
                icon="upload"
                title="Easy Uploads" 
                description="Upload your existing podcasts and manage your entire content library in one place"
              />
              <FeatureCard 
                icon="edit"
                title="Audio Editing" 
                description="Trim, cut, and enhance your audio with our built-in editor - no external software needed"
              />
              <FeatureCard 
                icon="analytics"
                title="Analytics" 
                description="Get detailed insights on your audience, play counts, and engagement metrics"
              />
            </div>
            
            <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700/50">
              <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                <span className="material-icons text-orange-500 mr-2">email</span>
                Get Notified
              </h3>
              <p className="text-gray-300 mb-4">
                Be the first to know when Creator Studio launches. Sign up for our waitlist to get early access!
              </p>
              
              <form className="flex flex-col md:flex-row gap-3">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="bg-zinc-700 text-white rounded-lg px-4 py-3 flex-grow focus:outline-none focus:ring-2 focus:ring-orange-500 border border-zinc-600"
                />
                <button 
                  type="button"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 whitespace-nowrap flex items-center justify-center"
                >
                  <span className="material-icons mr-1 text-sm">notification_add</span>
                  Join Waitlist
                </button>
              </form>
            </div>
          </div>
        </div>
        
        {/* Additional upcoming features section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="material-icons text-orange-500 mr-2">engineering</span>
            More Exciting Features in Development
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <UpcomingFeatureCard 
              icon="share"
              title="Cross-Platform Sharing" 
              description="Seamlessly share your podcasts across all major platforms with one click"
              progress={85}
            />
            <UpcomingFeatureCard 
              icon="groups"
              title="Collaborative Podcasting" 
              description="Invite co-hosts to join your recording sessions remotely in real-time"
              progress={65}
            />
            <UpcomingFeatureCard 
              icon="translate"
              title="Auto-Transcription" 
              description="Get automatic transcription and translation for your podcast content"
              progress={40}
            />
          </div>
        </div>
        
        {/* Feedback section */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 border border-zinc-700/30 text-center">
          <h2 className="text-xl font-semibold text-white mb-2">We Value Your Feedback</h2>
          <p className="text-gray-300 mb-4 max-w-2xl mx-auto">
            Have ideas for the Creator Studio? We'd love to hear them! Your feedback helps us build a better product.
          </p>
          <button 
            className="bg-white/10 hover:bg-white/15 text-white font-medium px-6 py-3 rounded-full transition-all duration-200 flex items-center mx-auto shadow-lg hover:shadow-orange-500/10"
          >
            <span className="material-icons mr-2">feedback</span>
            Share Your Ideas
          </button>
        </div>
        
        {/* Space for fixed player */}
        <div className="h-24"></div>
      </div>
    </main>
  );
};

// Feature card component
const FeatureCard = ({ icon, title, description }: { icon: string, title: string, description: string }) => (
  <div className="bg-zinc-800/70 rounded-lg p-4 flex items-start border border-zinc-700/30 hover:border-orange-500/30 transition-colors group">
    <div className="mr-3 mt-1 bg-orange-500/10 p-2 rounded-lg group-hover:bg-orange-500/20 transition-colors">
      <span className="material-icons text-orange-500">{icon}</span>
    </div>
    <div>
      <h3 className="font-medium text-white mb-1">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  </div>
);

// Upcoming feature card with progress bar
const UpcomingFeatureCard = ({ icon, title, description, progress }: { icon: string, title: string, description: string, progress: number }) => (
  <div className="bg-zinc-800 rounded-xl overflow-hidden shadow-lg border border-zinc-700/30 group transition-all duration-300 hover:shadow-orange-500/5 hover:border-orange-500/20">
    <div className="p-6">
      <div className="flex items-center justify-center mb-4 w-12 h-12 rounded-full bg-orange-500/10 text-orange-500 mx-auto group-hover:bg-orange-500/20 transition-colors">
        <span className="material-icons text-2xl">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-white text-center mb-2">{title}</h3>
      <p className="text-gray-400 text-center text-sm mb-4">{description}</p>
      
      <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-orange-600 to-amber-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs text-zinc-500 mt-2">
        <span>In development</span>
        <span>{progress}% complete</span>
      </div>
    </div>
  </div>
);

export default CreatePage;