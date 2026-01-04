import { useBotStats } from "@/hooks/use-bot-stats";
import { motion } from "framer-motion";
import { Music, Mic2, Radio, Play, Sparkles, Headphones, Send } from "lucide-react";
import { FeatureCard } from "@/components/FeatureCard";
import { StatsCounter } from "@/components/StatsCounter";

export default function Landing() {
  const { data: stats } = useBotStats();
  const botLink = "https://t.me/MusicFinderBot"; // Replace with actual bot username if known

  return (
    <div className="min-h-screen relative overflow-hidden text-foreground selection:bg-primary/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '7s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 w-full px-6 py-6 md:px-12 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary rounded-xl">
            <Music className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight">MusicBot</span>
        </div>
        <a 
          href={botLink}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium hover:scale-105 active:scale-95"
        >
          <Send className="w-4 h-4" />
          Open Telegram
        </a>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            <span>The ultimate music companion for Telegram</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold font-display tracking-tight leading-[0.9] mb-8 bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/40"
          >
            Find any song <br /> in seconds.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Identifies music playing around you, finds tracks by lyrics, and streams high-quality audio directly in your chat. No apps required.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href={botLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary hover:bg-primary/90 text-white font-semibold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              <Play className="w-5 h-5 fill-current" />
              Start Listening
            </a>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-card hover:bg-secondary text-foreground font-medium border border-border transition-all flex items-center justify-center gap-2"
            >
              Learn more
            </a>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-12 px-6 border-y border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
             <div className="col-span-1 md:col-span-2 text-center md:text-left">
               <h2 className="text-3xl font-bold font-display mb-2">Growing Community</h2>
               <p className="text-muted-foreground">Join thousands of music lovers discovering new tracks every day.</p>
             </div>
             <div className="col-span-1 flex justify-center md:justify-end">
                <StatsCounter 
                  value={stats?.userCount || 12450} 
                  label="Users exploring music right now" 
                />
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold font-display mb-6">Everything you need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Powerful features packed into a simple, elegant Telegram interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <FeatureCard
              icon={Mic2}
              title="Shazam Recognition"
              description="Record a voice note of any song playing nearby and we'll identify it instantly with high accuracy."
              delay={0.1}
            />
            <FeatureCard
              icon={Headphones}
              title="Find by Lyrics"
              description="Stuck with a line in your head? Type it out and we'll find the track, artist, and album for you."
              delay={0.2}
            />
            <FeatureCard
              icon={Radio}
              title="Radio Mode"
              description="Discover new music with our curated radio stations based on your listening history and preferences."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
            <Music className="w-5 h-5" />
            <span className="font-display font-bold">MusicBot</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MusicBot for Telegram. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
