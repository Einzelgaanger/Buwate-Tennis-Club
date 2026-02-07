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
    <section id="about" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Creative Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-secondary" />
      
      {/* Dots pattern */}
      <div className="absolute inset-0 bg-dots opacity-50" />

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Content */}
          <div>
            <span className="inline-flex items-center gap-2 text-accent font-semibold mb-4 text-sm uppercase tracking-wider">
              About Us
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
              Your Premier Tennis{' '}
              <span className="text-gradient-primary">Destination</span>{' '}
              in Kampala
            </h2>
            <div className="space-y-5 text-lg text-muted-foreground leading-relaxed mb-10">
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

            {/* Values */}
            <div className="grid sm:grid-cols-3 gap-6 mb-10">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="text-center sm:text-left cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mx-auto sm:mx-0">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-display font-semibold text-lg mb-2">{value.title}</h4>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>

            {/* Quick Info */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-card border border-border/50">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Location</p>
                  <p className="text-sm text-muted-foreground">{CLUB_INFO.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-card border border-border/50">
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

          {/* Image Grid */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              {/* Main Image - Junior Academy */}
              <div className="col-span-2 rounded-3xl overflow-hidden shadow-elegant">
                <img 
                  src={juniorAcademy} 
                  alt="Junior tennis academy training at Buwate Tennis Club" 
                  className="w-full aspect-[16/9] object-cover"
                />
              </div>
              
              {/* Secondary Image - Spectators Area */}
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <img 
                  src={clubSpectators} 
                  alt="Club members watching tennis matches" 
                  className="w-full aspect-square object-cover"
                />
              </div>

              {/* Payment Card */}
              <div className="bg-primary text-primary-foreground rounded-2xl p-6 flex flex-col justify-center">
                <p className="font-display font-semibold text-lg mb-2">Payment Made Easy</p>
                <p className="text-sm opacity-80 mb-4">Mobile Money only - No cash!</p>
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-sm font-medium">{CLUB_INFO.momoNumber}</p>
                  <p className="text-xs opacity-70">{CLUB_INFO.momoName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
