import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';
import playerImage from '@/assets/player-action.jpg';

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
    layoutEffect: false, // Optimize performance
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"], { clamp: true });

  return (
    <section ref={sectionRef} className="py-24 lg:py-32 relative overflow-hidden">
      {/* Parallax Background Image - clearer visibility */}
      <motion.div 
        style={{ y: backgroundY, willChange: 'transform' }}
        className="absolute inset-0 scale-110"
      >
        <img 
          src={playerImage} 
          alt="Tennis player in action" 
          className="w-full h-full object-cover"
        />
        {/* More subtle overlay for better image visibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-accent/85 via-accent/80 to-accent/70" />
      </motion.div>

      {/* Animated Decorative Elements - Reduced blur for performance */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 left-10 w-64 h-64 bg-white/15 rounded-full blur-2xl"
        style={{ willChange: 'transform, opacity' }}
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-10 right-10 w-80 h-80 bg-gold/25 rounded-full blur-2xl"
        style={{ willChange: 'transform, opacity' }}
      />
      <motion.div 
        animate={{ 
          y: [0, -30, 0],
          x: [0, 20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/4 w-40 h-40 bg-white/10 rounded-full blur-xl"
        style={{ willChange: 'transform' }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/30 rounded-full px-5 py-2 mb-8 border border-white/40"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
            <span className="text-sm font-medium text-white">Join Our Tennis Community</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
          >
            Ready to Join{' '}
            <motion.span 
              className="text-gold inline-block"
              animate={isInView ? { 
                textShadow: ["0 0 0px rgba(212,175,55,0)", "0 0 30px rgba(212,175,55,0.6)", "0 0 0px rgba(212,175,55,0)"]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Buwate Tennis Club?
            </motion.span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Start your tennis journey today. Book a court, join a coaching session, or become a member. 
            We can't wait to welcome you!
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button asChild size="lg" className="btn-gold text-lg px-10 py-6 rounded-xl group">
                <Link to="/auth?mode=signup">
                  Join Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
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
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
