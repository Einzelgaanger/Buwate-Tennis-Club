import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import playerImage from '@/assets/player-action.jpg';

export function CTASection() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 scale-110">
        <img 
          src={playerImage} 
          alt="Tennis player in action" 
          className="w-full h-full object-cover"
        />
        {/* More subtle overlay for better image visibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-accent/85 via-accent/80 to-accent/70" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/30 rounded-full px-5 py-2 mb-8 border border-white/40">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Join Our Tennis Community</span>
          </div>

          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to Join{' '}
            <span className="text-gold inline-block">
              Buwate Tennis Club?
            </span>
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            Start your tennis journey today. Book a court, join a coaching session, or become a member. 
            We can't wait to welcome you!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div>
              <Button asChild size="lg" className="btn-gold text-lg px-10 py-6 rounded-xl group">
                <Link to="/auth?mode=signup">
                  Join Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
            <div>
              <Button 
                asChild 
                size="lg" 
                variant="outline"
                className="border-white/40 text-white hover:bg-white/15 text-lg px-10 py-6 rounded-xl"
              >
                <a href={`tel:${'+256772675050'}`} className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Call Us
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
