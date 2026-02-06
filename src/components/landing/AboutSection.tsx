import { motion } from 'framer-motion';
import { MapPin, Clock, Phone, Mail, Trophy, Target, Heart } from 'lucide-react';
import { CLUB_INFO } from '@/lib/constants';
import tennisBallImage from '@/assets/tennis-ball-clay.jpg';
import courtNightImage from '@/assets/court-night.jpg';

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
    <section id="about" className="py-24 lg:py-32 bg-secondary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-dots opacity-40" />

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
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
                BTC is where tennis dreams become reality.
              </p>
            </div>

            {/* Values */}
            <div className="grid sm:grid-cols-3 gap-6 mb-10">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="text-center sm:text-left"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mx-auto sm:mx-0">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-display font-semibold text-lg mb-2">{value.title}</h4>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </motion.div>
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
          </motion.div>

          {/* Image Grid */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Main Image */}
              <div className="col-span-2 rounded-3xl overflow-hidden shadow-elegant">
                <img 
                  src={courtNightImage} 
                  alt="Clay court at night with floodlights" 
                  className="w-full aspect-[16/9] object-cover"
                />
              </div>
              
              {/* Secondary Image */}
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <img 
                  src={tennisBallImage} 
                  alt="Tennis ball on clay court" 
                  className="w-full aspect-square object-cover"
                />
              </div>

              {/* Payment Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="bg-primary text-primary-foreground rounded-2xl p-6 flex flex-col justify-center"
              >
                <p className="font-display font-semibold text-lg mb-2">Payment Made Easy</p>
                <p className="text-sm opacity-80 mb-4">Mobile Money only - No cash!</p>
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-sm font-medium">{CLUB_INFO.momoNumber}</p>
                  <p className="text-xs opacity-70">{CLUB_INFO.momoName}</p>
                </div>
              </motion.div>
            </div>

            {/* Decorative Element */}
            <div className="absolute -z-10 -top-8 -right-8 w-40 h-40 bg-gold/20 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
