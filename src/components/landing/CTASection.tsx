import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="py-24 bg-accent text-accent-foreground">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Ready to Join the Club?
          </h2>
          <p className="text-lg opacity-90 mb-10">
            Start your tennis journey today. Book a court, join a coaching session, or become a member. 
            We can't wait to welcome you!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-accent hover:bg-white/90 text-lg px-8">
              <Link to="/auth?mode=signup">
                Join Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 text-lg px-8"
            >
              <a href={`tel:${'+256772675050'}`}>
                Call Us
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
