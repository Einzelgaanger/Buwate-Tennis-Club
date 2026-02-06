import { MapPin, Clock, Phone, Mail } from 'lucide-react';
import { CLUB_INFO } from '@/lib/constants';

export function AboutSection() {
  return (
    <section id="about" className="py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <p className="text-accent font-semibold mb-3">About Us</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Your Premier Tennis Destination in Kampala
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Buwate Tennis Club is Kampala's premier tennis destination, offering two professional-grade 
                clay courts with full floodlight coverage for evening play.
              </p>
              <p>
                Our mission is to provide an exceptional tennis experience for players of all levels—from 
                beginners taking their first lesson to competitive players honing their skills.
              </p>
              <p>
                With two experienced coaches, a welcoming community, and a commitment to excellence, 
                BTC is where tennis dreams become reality.
              </p>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-6 mt-10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Location</p>
                  <p className="text-sm text-muted-foreground">{CLUB_INFO.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Hours</p>
                  <p className="text-sm text-muted-foreground">{CLUB_INFO.operatingHours}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Image/Visual */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl bg-primary/5 border border-border overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gold flex items-center justify-center">
                    <span className="text-gold-foreground font-display font-bold text-4xl">BTC</span>
                  </div>
                  <p className="font-display text-2xl font-bold text-primary">Professional Clay Courts</p>
                  <p className="text-muted-foreground">With Floodlights</p>
                </div>
              </div>
            </div>
            
            {/* Floating Card */}
            <div className="absolute -bottom-8 -left-8 bg-card rounded-2xl p-6 shadow-xl border border-border max-w-xs">
              <p className="font-display font-semibold mb-2">Payment Made Easy</p>
              <p className="text-sm text-muted-foreground mb-3">Mobile Money only - No cash!</p>
              <div className="bg-primary/5 rounded-lg p-3">
                <p className="text-sm font-medium">{CLUB_INFO.momoNumber}</p>
                <p className="text-xs text-muted-foreground">{CLUB_INFO.momoName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
