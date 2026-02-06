import { motion, useInView } from 'framer-motion';
import { Calendar, Users, CreditCard, Clock, Shield, Smartphone, Sun, Zap } from 'lucide-react';
import { useRef } from 'react';
import coachingImage from '@/assets/coaching-session.jpg';
import courtsAerialImage from '@/assets/courts-aerial.jpg';

const features = [
  {
    icon: Calendar,
    title: 'Instant Court Booking',
    description: 'Book your preferred court and time slot in seconds with real-time availability and instant confirmation.',
  },
  {
    icon: Users,
    title: 'Expert Coaching',
    description: 'Learn from certified coaches with private, semi-private, and group session options for all skill levels.',
  },
  {
    icon: CreditCard,
    title: 'Mobile Money Payments',
    description: 'Secure and convenient payments via Mobile Money. No cash handling, instant verification.',
  },
  {
    icon: Clock,
    title: 'Flexible Hours',
    description: 'Open from 8 AM to 10 PM daily with floodlit courts for evening play. Play when it suits you.',
  },
  {
    icon: Shield,
    title: 'Member Benefits',
    description: 'Exclusive rates, priority booking, family packages, and unlimited play options for members.',
  },
  {
    icon: Smartphone,
    title: 'Manage Online',
    description: 'Track bookings, payments, and membership status. Everything at your fingertips.',
  },
];

export function FeaturesSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 });

  return (
    <section 
      ref={sectionRef}
      id="features" 
      className="py-24 lg:py-32 relative overflow-hidden"
    >
      {/* Creative Background with gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-secondary" />
      
      {/* Animated Background Pattern */}
      <motion.div 
        animate={{ 
          backgroundPosition: isInView ? ["0% 0%", "100% 100%"] : "0% 0%"
        }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0 bg-dots opacity-60"
        style={{ backgroundSize: "30px 30px" }}
      />
      
      {/* Floating decorative shapes */}
      <motion.div 
        animate={{ y: [0, -30, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-20 w-32 h-32 bg-primary/10 rounded-3xl blur-xl"
      />
      <motion.div 
        animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-40 left-20 w-40 h-40 bg-accent/10 rounded-full blur-2xl"
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 right-1/4 w-24 h-24 bg-gold/15 rounded-full blur-xl"
      />
      
      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 text-accent font-semibold mb-4 text-sm uppercase tracking-wider"
          >
            <Zap className="w-4 h-4" />
            Why Choose Us
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground"
          >
            Everything You Need for Your{' '}
            <span className="text-gradient-clay">Tennis Journey</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-lg text-muted-foreground leading-relaxed"
          >
            From professional courts to expert coaching, we provide a complete tennis experience 
            designed for players of all levels.
          </motion.p>
        </motion.div>

        {/* Image + Features Layout */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Image Stack */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative">
              <motion.div 
                className="rounded-3xl overflow-hidden shadow-elegant"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <img 
                  src={courtsAerialImage} 
                  alt="Aerial view of clay tennis courts" 
                  className="w-full aspect-[4/3] object-cover"
                />
              </motion.div>
              
              {/* Overlapping Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="absolute -bottom-8 -right-8 w-2/3 rounded-2xl overflow-hidden shadow-2xl border-4 border-background"
              >
                <img 
                  src={coachingImage} 
                  alt="Professional coaching session" 
                  className="w-full aspect-[4/3] object-cover"
                />
              </motion.div>

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                className="absolute top-6 left-6 bg-primary text-primary-foreground rounded-2xl px-5 py-3 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <Sun className="w-5 h-5" />
                  <div>
                    <p className="font-display font-semibold text-lg">Professional Grade</p>
                    <p className="text-xs opacity-80">Red Clay Courts</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Features List */}
          <div className="grid sm:grid-cols-2 gap-6">
            {features.slice(0, 4).map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="feature-card group cursor-pointer"
              >
                <motion.div 
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-5 group-hover:from-primary/20 group-hover:to-accent/20 transition-colors duration-300"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <feature.icon className="w-7 h-7 text-primary" />
                </motion.div>
                <h3 className="font-display text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Features Row */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {features.slice(4).map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="feature-card group text-center lg:text-left cursor-pointer"
            >
              <motion.div 
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-5 mx-auto lg:mx-0 group-hover:from-primary/20 group-hover:to-accent/20 transition-colors duration-300"
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <feature.icon className="w-7 h-7 text-primary" />
              </motion.div>
              <h3 className="font-display text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
