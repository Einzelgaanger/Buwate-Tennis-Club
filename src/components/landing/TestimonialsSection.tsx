import { motion, useInView } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { useRef } from 'react';
import testimonial1 from '@/assets/testimonial-1.jpg';
import testimonial2 from '@/assets/testimonial-2.jpg';
import testimonial3 from '@/assets/testimonial-3.jpg';
import membersImage from '@/assets/members-community.jpg';

const testimonials = [
  {
    content: "The clay courts at Buwate Tennis Club are exceptionally maintained. I've been a member for a year and the experience keeps getting better! The coaching staff truly cares about your progress.",
    author: "Sarah Nakamya",
    role: "Club Member",
    image: testimonial1,
    rating: 5,
  },
  {
    content: "Coach David transformed my serve in just a few sessions. The online booking system makes scheduling lessons so convenient. Best tennis club in Kampala hands down!",
    author: "Michael Kato",
    role: "Junior Player",
    image: testimonial2,
    rating: 5,
  },
  {
    content: "Perfect family tennis destination. The kids love it here and the staff is incredibly welcoming. We play every weekend and it's become our favorite family activity.",
    author: "The Okello Family",
    role: "Family Members",
    image: testimonial3,
    rating: 5,
  },
];

export function TestimonialsSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 });

  return (
    <section ref={sectionRef} className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background with clearer image */}
      <div className="absolute inset-0 hero-gradient" />
      
      {/* Background Image - more visible */}
      <motion.div 
        className="absolute inset-0"
        animate={isInView ? { scale: [1.05, 1] } : { scale: 1.05 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <img 
          src={membersImage} 
          alt="Tennis community" 
          className="w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/70 to-primary/80" />
      </motion.div>
      
      {/* Animated pattern overlay */}
      <motion.div 
        animate={{ 
          backgroundPosition: isInView ? ["0% 0%", "100% 100%"] : "0% 0%"
        }}
        transition={{ duration: 30, repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0 court-pattern opacity-10"
      />
      
      {/* Floating orbs */}
      <motion.div 
        animate={{ y: [0, -40, 0], x: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-10 w-40 h-40 bg-gold/20 rounded-full blur-3xl"
      />
      <motion.div 
        animate={{ y: [0, 30, 0], x: [0, -30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/4 right-10 w-60 h-60 bg-accent/15 rounded-full blur-3xl"
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 text-gold font-semibold mb-4 text-sm uppercase tracking-wider"
          >
            <Star className="w-4 h-4 fill-gold" />
            Testimonials
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white"
          >
            What Our Members{' '}
            <span className="hero-text-gradient">Say About Us</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-lg text-white/80"
          >
            Join hundreds of happy members who have made Buwate Tennis Club their tennis home.
          </motion.p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ delay: 0.2 + index * 0.15, duration: 0.7 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="glass-card p-8 group hover:bg-white/20 transition-all duration-300"
            >
              {/* Quote Icon */}
              <motion.div 
                className="mb-6"
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <Quote className="w-12 h-12 text-gold/50" />
              </motion.div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                    transition={{ delay: 0.4 + index * 0.15 + i * 0.05, duration: 0.3 }}
                  >
                    <Star className="w-5 h-5 text-gold fill-gold" />
                  </motion.div>
                ))}
              </div>

              {/* Content */}
              <p className="text-white/90 leading-relaxed mb-8 text-lg">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <motion.div 
                  className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-gold/40"
                  whileHover={{ scale: 1.1 }}
                >
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.author}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <div>
                  <p className="font-display font-semibold text-white text-lg">{testimonial.author}</p>
                  <p className="text-sm text-white/70">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="mt-20 glass-card p-8 md:p-10"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '100+', label: 'Active Members' },
              { value: '500+', label: 'Monthly Sessions' },
              { value: '4.9', label: 'Average Rating' },
              { value: '2+', label: 'Years of Excellence' },
            ].map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.1 }}
              >
                <motion.p 
                  className="font-display text-4xl md:text-5xl font-bold text-gold mb-2"
                  animate={isInView ? { 
                    textShadow: ["0 0 0px rgba(212,175,55,0)", "0 0 20px rgba(212,175,55,0.5)", "0 0 0px rgba(212,175,55,0)"]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                >
                  {stat.value}
                </motion.p>
                <p className="text-white/80 text-sm md:text-base">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
