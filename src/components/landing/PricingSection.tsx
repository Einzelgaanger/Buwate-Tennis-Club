import { Link } from 'react-router-dom';
import { Check, Star, Sparkles, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, PRICING } from '@/lib/constants';

const cardMorphismClasses = ['pricing-card--blue', 'pricing-card--amber', 'pricing-card--emerald'];

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
    price: PRICING.membership.annual,
    priceLabel: '/year',
    featured: true,
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
    <section id="pricing" className="pt-12 pb-24 lg:pt-16 lg:pb-32 relative overflow-hidden">
      {/* Creative Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/70 to-background" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid opacity-80" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 text-accent font-semibold mb-2 text-xs uppercase tracking-wider">
            <Star className="w-3.5 h-3.5" />
            Pricing Plans
          </span>
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
            Simple,{' '}
            <span className="text-gradient-gold">Transparent</span>{' '}
            Pricing
          </h2>
          <p className="text-sm text-muted-foreground">
            Choose the plan that fits your playing style. All prices in Ugandan Shillings (UGX).
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-5 max-w-4xl mx-auto pt-6">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`pricing-card flex flex-col relative group overflow-hidden ${cardMorphismClasses[index]} ${plan.featured ? 'featured' : ''}`}
            >
              {/* Icon + Title + Description */}
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${plan.featured ? 'bg-accent/10' : 'bg-primary/10'}`}>
                  <plan.icon className={`w-5 h-5 ${plan.featured ? 'text-accent' : 'text-primary'}`} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-bold leading-tight">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm leading-snug mt-0.5">{plan.description}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <span className="font-display text-2xl md:text-3xl font-bold">
                  {formatCurrency(plan.price)}
                </span>
                <span className="text-muted-foreground text-sm">{plan.priceLabel}</span>
              </div>

              <ul className="space-y-2 mb-4 flex-1">
                {plan.features.map((feature, featureIndex) => (
                  <li 
                    key={featureIndex} 
                    className="flex items-start gap-2"
                  >
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.featured ? 'bg-accent/10' : 'bg-primary/10'}`}>
                      <Check className={`w-2.5 h-2.5 ${plan.featured ? 'text-accent' : 'text-primary'}`} />
                    </div>
                    <span className="text-foreground text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={`w-full rounded-lg py-3.5 text-sm ${plan.featured ? 'btn-gold' : ''}`}
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
        <div className="mt-8 text-center space-y-2">
          <p className="text-muted-foreground text-sm">
            One-time registration fee: <span className="font-semibold text-foreground">{formatCurrency(PRICING.membership.registration)}</span>
          </p>
          <p className="text-muted-foreground text-sm">
            Monthly membership option: <span className="font-semibold text-foreground">{formatCurrency(PRICING.membership.monthly)}/month</span>
          </p>
        </div>
      </div>
    </section>
  );
}
