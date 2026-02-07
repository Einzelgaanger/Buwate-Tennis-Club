import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-court.jpg';
import playerImage from '@/assets/player-action.jpg';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden above-fold">
      {/* Background Image */}
      <div className="absolute inset-0 scale-110">
        <img 
          src={heroImage} 
          alt="Premium clay tennis court at sunset" 
          className="w-full h-full object-cover"
        />
        {/* More subtle overlay for better image visibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Heading */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1]">
              Elevate Your Game at{' '}
              <span className="hero-text-gradient inline-block">
                Buwate Tennis Club
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-white/80 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              Experience world-class red clay courts, expert coaching, and a thriving tennis 
              community in the heart of Kampala. Your tennis journey begins here.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="btn-gold text-lg px-8 py-6 rounded-xl group">
                <Link to="/auth?mode=signup">
                  Join the Club
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 rounded-xl bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <Link to="/auth" className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Book a Court
                </Link>
              </Button>
            </div>
          </div>

          {/* Right - Featured Image */}
          <div className="hidden lg:block relative">
            <div className="relative">
              {/* Main Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src={playerImage} 
                  alt="Tennis player in action" 
                  className="w-full aspect-[4/5] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
