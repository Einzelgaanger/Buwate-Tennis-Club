import { Link } from 'react-router-dom';
import { Check, Star, Sparkles, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, PRICING } from '@/lib/constants';

const pricingPlans = [
  {
    name: 'Pay as You Play',
    description: 'Perfect for occasional players and visitors',
    price: PRICING.courtBooking.nonMember.standard,
    priceLabel: '/hour',
    featured: false,
    icon: Zap,
    features: [
      'Book courts anytime',
      'Access to both clay courts',
      'Floodlit evening sessions',
      'Online booking system',
      'Mobile Money payment',
    ],
  },
  {
    name: 'Club Membership',
    description: 'Best value for regular players',
    price: PRICING.membership.monthly,
    priceLabel: '/month',
    featured: true,
    badge: 'Most Popular',
    icon: Crown,
    features: [
      'Discounted court rates (UGX 10,000/hr)',
      'Book up to 14 days in advance',
      'Family member discounts',
      'Priority booking access',
      'Member events & tournaments',
      'Guest passes (2/month)',
    ],
  },
  {
    name: 'Unlimited Monthly',
    description: 'Unlimited play, unlimited fun',
    price: PRICING.monthlyPackages.memberMonthly,
    priceLabel: '/month',
    featured: false,
    icon: Sparkles,
    features: [
      'Unlimited court access',
      'No per-session fees',
      'Book any available slot',
      'Family add-on available',
      'Coach session discounts',
      'Free equipment storage',
    ],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Creative Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/50 to-background" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid opacity-40" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 text-accent font-semibold mb-4 text-sm uppercase tracking-wider">
            <Star className="w-4 h-4" />
            Pricing Plans
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Simple,{' '}
            <span className="text-gradient-gold">Transparent</span>{' '}
            Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your playing style. All prices in Ugandan Shillings (UGX).
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`pricing-card ${plan.featured ? 'featured ring-2 ring-accent/50' : ''} flex flex-col relative group`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${plan.featured ? 'bg-accent/10' : 'bg-primary/10'}`}>
                <plan.icon className={`w-7 h-7 ${plan.featured ? 'text-accent' : 'text-primary'}`} />
              </div>
              
              <h3 className="font-display text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground mb-6">{plan.description}</p>
              
              <div className="mb-8">
                <span className="font-display text-4xl md:text-5xl font-bold">
                  {formatCurrency(plan.price)}
                </span>
                <span className="text-muted-foreground text-lg">{plan.priceLabel}</span>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, featureIndex) => (
                  <li 
                    key={featureIndex} 
                    className="flex items-start gap-3"
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.featured ? 'bg-accent/10' : 'bg-primary/10'}`}>
                      <Check className={`w-3 h-3 ${plan.featured ? 'text-accent' : 'text-primary'}`} />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={`w-full rounded-xl py-6 text-lg ${plan.featured ? 'btn-gold' : ''}`}
                variant={plan.featured ? 'default' : 'outline'}
              >
                <Link to="/auth?mode=signup">
                  Get Started
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center space-y-3">
          <p className="text-muted-foreground">
            One-time registration fee: <span className="font-semibold text-foreground">{formatCurrency(PRICING.membership.registration)}</span>
          </p>
          <p className="text-muted-foreground">
            Save more with annual membership: <span className="font-semibold text-foreground">{formatCurrency(PRICING.membership.annual)}/year</span>{' '}
            <span className="text-accent font-medium">(2 months free!)</span>
          </p>
        </div>
      </div>
    </section>
  );
}
