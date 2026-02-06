import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { CLUB_INFO } from '@/lib/constants';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center">
                <span className="text-gold-foreground font-display font-bold text-xl">B</span>
              </div>
              <div>
                <p className="font-display font-bold text-xl">{CLUB_INFO.shortName}</p>
                <p className="text-sm opacity-80">Tennis Club</p>
              </div>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              Premier tennis destination in Buwate, Kampala. Two professional clay courts with floodlights, 
              expert coaching, and a vibrant tennis community.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-lg">Quick Links</h4>
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
                  className="block text-sm opacity-80 hover:opacity-100 transition-opacity"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-lg">Contact Us</h4>
            <div className="space-y-3">
              <a 
                href={`tel:${CLUB_INFO.phones[0].replace(/\s/g, '')}`}
                className="flex items-center gap-3 text-sm opacity-80 hover:opacity-100 transition-opacity"
              >
                <Phone className="w-4 h-4" />
                {CLUB_INFO.phones[0]}
              </a>
              <a 
                href={`tel:${CLUB_INFO.phones[1].replace(/\s/g, '')}`}
                className="flex items-center gap-3 text-sm opacity-80 hover:opacity-100 transition-opacity"
              >
                <Phone className="w-4 h-4" />
                {CLUB_INFO.phones[1]}
              </a>
              <a 
                href={`mailto:${CLUB_INFO.email}`}
                className="flex items-center gap-3 text-sm opacity-80 hover:opacity-100 transition-opacity"
              >
                <Mail className="w-4 h-4" />
                {CLUB_INFO.email}
              </a>
              <div className="flex items-center gap-3 text-sm opacity-80">
                <MapPin className="w-4 h-4" />
                {CLUB_INFO.location}
              </div>
            </div>
          </div>

          {/* Hours */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-lg">Hours</h4>
            <div className="flex items-start gap-3 text-sm opacity-80">
              <Clock className="w-4 h-4 mt-0.5" />
              <div>
                <p className="font-medium">Open Daily</p>
                <p>{CLUB_INFO.operatingHours}</p>
              </div>
            </div>
            <div className="pt-4">
              <p className="text-sm font-medium mb-2">Payment</p>
              <div className="bg-gold/20 rounded-lg p-3">
                <p className="text-sm font-medium">Mobile Money Only</p>
                <p className="text-xs opacity-80">{CLUB_INFO.momoNumber}</p>
                <p className="text-xs opacity-80">{CLUB_INFO.momoName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm opacity-60">
            © {currentYear} {CLUB_INFO.name}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-sm opacity-60 hover:opacity-100 transition-opacity">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm opacity-60 hover:opacity-100 transition-opacity">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
