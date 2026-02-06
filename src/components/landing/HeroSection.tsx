import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Play, Calendar, Users, Award, Sparkles, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';
import heroImage from '@/assets/hero-court.jpg';
import playerImage from '@/assets/player-action.jpg';

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Parallax Background Image */}
      <motion.div 
        style={{ y: backgroundY }}
        className="absolute inset-0 scale-110"
      >
        <img 
          src={heroImage} 
          alt="Premium clay tennis court at sunset" 
          className="w-full h-full object-cover"
        />
        {/* More subtle overlay for better image visibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
      </motion.div>
      
      {/* Animated Particles/Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-10 w-72 h-72 bg-gold/30 rounded-full blur-[120px]" 
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-[150px]" 
      />
      <motion.div 
        animate={{ 
          y: [0, -20, 0],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/15 rounded-full blur-[100px]" 
      />

      <motion.div 
        style={{ y: textY, opacity }}
        className="container mx-auto px-4 relative z-10 pt-24 pb-16"
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-gold/25 backdrop-blur-md rounded-full px-5 py-2.5 mb-8 border border-gold/40"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="w-4 h-4 text-gold" />
              </motion.div>
              <span className="text-sm font-medium text-white/95">Premier Tennis Destination in Kampala</span>
            </motion.div>

            {/* Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1]"
            >
              Elevate Your Game at{' '}
              <motion.span 
                className="hero-text-gradient inline-block"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              >
                Buwate Tennis Club
              </motion.span>
            </motion.h1>

            {/* Subheading */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="text-lg sm:text-xl text-white/80 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed"
            >
              Experience world-class red clay courts, expert coaching, and a thriving tennis 
              community in the heart of Kampala. Your tennis journey begins here.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
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
            </motion.div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="grid grid-cols-3 gap-6 mt-14 max-w-md mx-auto lg:mx-0"
            >
              {[
                { icon: Calendar, value: '2', label: 'Clay Courts' },
                { icon: Users, value: '2', label: 'Pro Coaches' },
                { icon: Award, value: '14h', label: 'Daily Open' },
              ].map((stat, index) => (
                <motion.div 
                  key={index} 
                  className="text-center lg:text-left group"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-12 h-12 mx-auto lg:mx-0 mb-3 rounded-2xl bg-gold/25 flex items-center justify-center group-hover:bg-gold/40 transition-colors duration-300">
                    <stat.icon className="w-5 h-5 text-gold" />
                  </div>
                  <p className="font-display text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-white/70">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - Featured Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block relative"
          >
            <div className="relative">
              {/* Main Image with hover effect */}
              <motion.div 
                className="relative rounded-3xl overflow-hidden shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <img 
                  src={playerImage} 
                  alt="Tennis player in action" 
                  className="w-full aspect-[4/5] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </motion.div>

              {/* Floating Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-5 shadow-elegant max-w-[220px]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Award className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-foreground">Pro Coaching</p>
                    <p className="text-xs text-muted-foreground">Available Daily</p>
                  </div>
                </div>
              </motion.div>

              {/* Animated Glowing Orb */}
              <motion.div 
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-8 -right-8 w-24 h-24 bg-gold/40 rounded-full blur-2xl" 
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => {
            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <span className="text-white/60 text-sm font-medium">Scroll to explore</span>
          <div className="w-8 h-12 rounded-full border-2 border-white/40 flex justify-center pt-2">
            <motion.div 
              animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-1.5 h-3 rounded-full bg-white/70" 
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
