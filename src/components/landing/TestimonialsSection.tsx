import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import testimonial1 from '@/assets/testimonial-1.jpg';
import testimonial2 from '@/assets/testimonial-2.jpg';
import testimonial3 from '@/assets/testimonial-3.jpg';
import membersImage from '@/assets/members-community.jpg';

const testimonials = [
  {
    content: "The clay courts at BTC are exceptionally maintained. I've been a member for a year and the experience keeps getting better! The coaching staff truly cares about your progress.",
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut" as const,
    },
  },
};

export function TestimonialsSection() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 court-pattern opacity-20" />
      
      {/* Community Image Overlay */}
      <div className="absolute inset-0 opacity-10">
        <img 
          src={membersImage} 
          alt="Tennis community" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 text-gold font-semibold mb-4 text-sm uppercase tracking-wider">
            <Star className="w-4 h-4 fill-gold" />
            Testimonials
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            What Our Members{' '}
            <span className="hero-text-gradient">Say About Us</span>
          </h2>
          <p className="text-lg text-white/70">
            Join hundreds of happy members who have made BTC their tennis home.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="glass-card p-8 group hover:bg-white/15 transition-colors duration-300"
            >
              {/* Quote Icon */}
              <div className="mb-6">
                <Quote className="w-12 h-12 text-gold/40" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-gold fill-gold" />
                ))}
              </div>

              {/* Content */}
              <p className="text-white/85 leading-relaxed mb-8 text-lg">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-gold/30">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.author}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-display font-semibold text-white text-lg">{testimonial.author}</p>
                  <p className="text-sm text-white/60">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="mt-20 glass-card p-8 md:p-10"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '100+', label: 'Active Members' },
              { value: '500+', label: 'Monthly Sessions' },
              { value: '4.9', label: 'Average Rating' },
              { value: '2+', label: 'Years of Excellence' },
            ].map((stat, index) => (
              <div key={index}>
                <p className="font-display text-4xl md:text-5xl font-bold text-gold mb-2">{stat.value}</p>
                <p className="text-white/70 text-sm md:text-base">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
