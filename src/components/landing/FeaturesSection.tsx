import { Calendar, Users, CreditCard, Clock, Shield, Smartphone } from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Easy Court Booking',
    description: 'Book your preferred court and time slot in seconds. Real-time availability and instant confirmation.',
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
  return (
    <section id="features" className="py-24 bg-secondary">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-accent font-semibold mb-3">Why Choose Us</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Everything You Need for Your Tennis Journey
          </h2>
          <p className="text-muted-foreground">
            From professional courts to expert coaching, we provide a complete tennis experience 
            designed for players of all levels.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
