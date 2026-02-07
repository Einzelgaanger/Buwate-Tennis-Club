import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Instagram, Facebook, Twitter } from 'lucide-react';
import { CLUB_INFO } from '@/lib/constants';
import logoWhite from '@/assets/logo-white.jpeg';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 court-pattern opacity-10" />
      
      <div className="container mx-auto px-4 py-10 lg:py-12 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {/* Brand */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <img 
                src={logoWhite} 
                alt="Buwate Tennis Club" 
                className="h-10 w-auto object-contain"
              />
              <div>
                <p className="font-display font-bold text-base">{CLUB_INFO.name}</p>
              </div>
            </div>
            <p className="text-xs opacity-75 leading-relaxed">
              Premier tennis destination in Buwate, Kampala. Two professional red clay courts with floodlights, 
              expert coaching, and a vibrant tennis community.
            </p>
            {/* Social Links */}
            <div className="flex gap-2">
              {[
                { icon: Instagram, href: '#' },
                { icon: Facebook, href: '#' },
                { icon: Twitter, href: '#' },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="space-y-3"
          >
            <h4 className="font-display font-semibold text-sm">Quick Links</h4>
            <nav className="space-y-2">
              {[
                { href: '/#features', label: 'Features' },
                { href: '/#pricing', label: 'Pricing' },
                { href: '/#about', label: 'About Us' },
                { href: '/auth', label: 'Join Club' },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block text-xs opacity-75 hover:opacity-100 transition-opacity hover:translate-x-1 duration-200"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </motion.div>

          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-3"
          >
            <h4 className="font-display font-semibold text-sm">Contact Us</h4>
            <div className="space-y-2">
              <a 
                href={`tel:${CLUB_INFO.phones[0].replace(/\s/g, '')}`}
                className="flex items-center gap-2 text-xs opacity-75 hover:opacity-100 transition-opacity"
              >
                <Phone className="w-3.5 h-3.5 shrink-0" />
                {CLUB_INFO.phones[0]}
              </a>
              <a 
                href={`tel:${CLUB_INFO.phones[1].replace(/\s/g, '')}`}
                className="flex items-center gap-2 text-xs opacity-75 hover:opacity-100 transition-opacity"
              >
                <Phone className="w-3.5 h-3.5 shrink-0" />
                {CLUB_INFO.phones[1]}
              </a>
              <a 
                href={`mailto:${CLUB_INFO.email}`}
                className="flex items-center gap-2 text-xs opacity-75 hover:opacity-100 transition-opacity"
              >
                <Mail className="w-3.5 h-3.5 shrink-0" />
                {CLUB_INFO.email}
              </a>
              <div className="flex items-center gap-2 text-xs opacity-75">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {CLUB_INFO.location}
              </div>
            </div>
          </motion.div>

          {/* Hours & Payment */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-3"
          >
            <h4 className="font-display font-semibold text-sm">Hours & Payment</h4>
            <div className="flex items-start gap-2 text-xs opacity-75">
              <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium opacity-100">Open Daily</p>
                <p>{CLUB_INFO.operatingHours}</p>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-xs font-medium mb-2">Payment Method</p>
              <div className="bg-gold/20 rounded-lg p-3">
                <p className="text-xs font-semibold">Mobile Money Only</p>
                <p className="text-[10px] opacity-80 mt-0.5">{CLUB_INFO.momoNumber}</p>
                <p className="text-[10px] opacity-80">{CLUB_INFO.momoName}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8 pt-6 border-t border-primary-foreground/20 flex flex-col md:flex-row justify-between items-center gap-3"
        >
          <p className="text-xs opacity-60">
            © {currentYear} {CLUB_INFO.name}. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link to="/privacy" className="text-xs opacity-60 hover:opacity-100 transition-opacity">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-xs opacity-60 hover:opacity-100 transition-opacity">
              Terms of Service
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
