import { motion, useInView } from 'framer-motion';
import { MapPin, Clock, Trophy, Target, Heart } from 'lucide-react';
import { CLUB_INFO } from '@/lib/constants';
import { useRef } from 'react';
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
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 });

  return (
    <section ref={sectionRef} id="about" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Creative Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-secondary" />
      
      {/* Animated dots pattern */}
      <motion.div 
        animate={{ 
          backgroundPosition: isInView ? ["0% 0%", "50% 50%"] : "0% 0%"
        }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0 bg-dots opacity-50"
      />
      
      {/* Floating decorative shapes */}
      <motion.div 
        animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-32 w-48 h-48 bg-gold/10 rounded-full blur-3xl"
      />
      <motion.div 
        animate={{ y: [0, 25, 0], x: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-32 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
      />

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.8 }}
          >
            <motion.span 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 text-accent font-semibold mb-4 text-sm uppercase tracking-wider"
            >
              About Us
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight"
            >
              Your Premier Tennis{' '}
              <span className="text-gradient-primary">Destination</span>{' '}
              in Kampala
            </motion.h2>
            <div className="space-y-5 text-lg text-muted-foreground leading-relaxed mb-10">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Buwate Tennis Club is Kampala's premier tennis destination, offering two professional-grade 
                red clay courts with full floodlight coverage for evening play.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Our mission is to provide an exceptional tennis experience for players of all levels—from 
                beginners taking their first lesson to competitive players honing their skills.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                With experienced coaches, a welcoming community, and a commitment to excellence, 
                Buwate Tennis Club is where tennis dreams become reality.
              </motion.p>
            </div>

            {/* Values */}
            <div className="grid sm:grid-cols-3 gap-6 mb-10">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="text-center sm:text-left cursor-pointer"
                >
                  <motion.div 
                    className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mx-auto sm:mx-0"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <value.icon className="w-6 h-6 text-primary" />
                  </motion.div>
                  <h4 className="font-display font-semibold text-lg mb-2">{value.title}</h4>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Quick Info */}
            <div className="grid sm:grid-cols-2 gap-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                className="flex items-start gap-4 p-4 rounded-2xl bg-card border border-border/50"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Location</p>
                  <p className="text-sm text-muted-foreground">{CLUB_INFO.location}</p>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                className="flex items-start gap-4 p-4 rounded-2xl bg-card border border-border/50"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Hours</p>
                  <p className="text-sm text-muted-foreground">{CLUB_INFO.operatingHours}</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Image Grid */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Main Image */}
              <motion.div 
                className="col-span-2 rounded-3xl overflow-hidden shadow-elegant"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <img 
                  src={courtNightImage} 
                  alt="Clay court at night with floodlights" 
                  className="w-full aspect-[16/9] object-cover"
                />
              </motion.div>
              
              {/* Secondary Image */}
              <motion.div 
                className="rounded-2xl overflow-hidden shadow-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                <img 
                  src={tennisBallImage} 
                  alt="Tennis ball on clay court" 
                  className="w-full aspect-square object-cover"
                />
              </motion.div>

              {/* Payment Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
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
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -z-10 -top-8 -right-8 w-40 h-40 bg-gold/25 rounded-full blur-3xl" 
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
