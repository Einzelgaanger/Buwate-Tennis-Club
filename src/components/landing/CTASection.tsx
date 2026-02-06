import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import playerImage from '@/assets/player-action.jpg';

export function CTASection() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={playerImage} 
          alt="Tennis player in action" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-accent/95 via-accent/90 to-accent/80" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-gold/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2 mb-8 border border-white/30"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Join Our Tennis Community</span>
          </motion.div>

          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to Join the{' '}
            <span className="text-gold">Club?</span>
          </h2>
          <p className="text-xl text-white/85 mb-12 max-w-2xl mx-auto leading-relaxed">
            Start your tennis journey today. Book a court, join a coaching session, or become a member. 
            We can't wait to welcome you!
          </p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button asChild size="lg" className="btn-gold text-lg px-10 py-6 rounded-xl group">
              <Link to="/auth?mode=signup">
                Join Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 text-lg px-10 py-6 rounded-xl backdrop-blur-sm"
            >
              <a href={`tel:${'+256772675050'}`} className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Call Us
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
