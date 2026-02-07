import { MapPin, Clock, Trophy, Target, Heart } from 'lucide-react';
import { CLUB_INFO } from '@/lib/constants';
import juniorAcademy from '@/assets/junior-tennis-academy.jpg';
import annualTournament from '@/assets/annual-tournament.webp';
import clubSpectators from '@/assets/club-spectators.webp';

const values = [
  {
    icon: Trophy,
    title: 'Excellence',
    description: 'We maintain the highest standards in court quality and coaching.',
  },
  {
    icon: Target,
    title: 'Growth',
    description: 'Every player deserves the chance to improve and reach their potential.',
  },
  {
    icon: Heart,
    title: 'Community',
    description: 'Tennis is better together. We foster lasting friendships.',
  },
];

export function AboutSection() {
  return (
    <section id="about" className="py-12 lg:py-20 relative overflow-hidden">
      {/* Creative Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-secondary" />
      
      {/* Dots pattern */}
      <div className="absolute inset-0 bg-dots opacity-50" />

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <div>
            <span className="inline-flex items-center gap-2 text-accent font-semibold mb-2 text-xs uppercase tracking-wider">
              About Us
            </span>
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
              Your Premier Tennis{' '}
              <span className="text-gradient-primary">Destination</span>{' '}
              in Kampala
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed mb-6">
              <p>
                Buwate Tennis Club is Kampala's premier tennis destination, offering two professional-grade 
                red clay courts with full floodlight coverage for evening play.
              </p>
              <p>
                Our mission is to provide an exceptional tennis experience for players of all levels—from 
                beginners taking their first lesson to competitive players honing their skills.
              </p>
              <p>
                With experienced coaches, a welcoming community, and a commitment to excellence, 
                Buwate Tennis Club is where tennis dreams become reality.
              </p>
            </div>

            {/* Values - 2 cols, 2 rows */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 rounded-xl bg-card/50 border border-border/40"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <value.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-display font-semibold text-sm mb-0.5">{value.title}</h4>
                    <p className="text-xs text-muted-foreground leading-snug">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2 p-3 rounded-xl bg-card/50 border border-border/40">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs mb-0.5">Location</p>
                  <p className="text-xs text-muted-foreground leading-snug">{CLUB_INFO.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-xl bg-card/50 border border-border/40">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs mb-0.5">Hours</p>
                  <p className="text-xs text-muted-foreground leading-snug">{CLUB_INFO.operatingHours}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Image Grid */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-3">
              {/* Main Image - Junior Academy */}
              <div className="col-span-2 rounded-2xl overflow-hidden shadow-elegant">
                <img 
                  src={juniorAcademy} 
                  alt="Junior tennis academy training at Buwate Tennis Club" 
                  className="w-full aspect-[16/9] object-cover"
                />
              </div>
              
              {/* Secondary Image - Spectators Area */}
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={clubSpectators} 
                  alt="Club members watching tennis matches" 
                  className="w-full aspect-square object-cover"
                />
              </div>

              {/* Payment Card */}
              <div className="bg-primary text-primary-foreground rounded-xl p-4 flex flex-col justify-center">
                <p className="font-display font-semibold text-sm mb-1">Payment Made Easy</p>
                <p className="text-xs opacity-80 mb-2">Mobile Money only - No cash!</p>
                <div className="bg-white/10 rounded-lg p-2">
                  <p className="text-xs font-medium">{CLUB_INFO.momoNumber}</p>
                  <p className="text-[10px] opacity-70">{CLUB_INFO.momoName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
