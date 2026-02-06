import { Link } from 'react-router-dom';
import { Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, PRICING } from '@/lib/constants';

const pricingPlans = [
  {
    name: 'Pay as You Play',
    description: 'Perfect for occasional players',
    price: PRICING.courtBooking.nonMember.standard,
    priceLabel: '/hour',
    featured: false,
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
    <section id="pricing" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-accent font-semibold mb-3">Pricing Plans</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground">
            Choose the plan that fits your playing style. All prices in Ugandan Shillings (UGX).
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`pricing-card ${plan.featured ? 'featured' : ''} flex flex-col`}
            >
              {plan.badge && (
                <div className="flex items-center gap-1.5 mb-4">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  <span className="text-sm font-semibold text-accent">{plan.badge}</span>
                </div>
              )}
              
              <h3 className="font-display text-xl font-semibold mb-2">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
              
              <div className="mb-6">
                <span className="font-display text-4xl font-bold">{formatCurrency(plan.price)}</span>
                <span className="text-muted-foreground">{plan.priceLabel}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={plan.featured ? 'btn-gold w-full' : 'w-full'}
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
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            One-time registration fee: {formatCurrency(PRICING.membership.registration)}
          </p>
          <p className="text-sm text-muted-foreground">
            Save more with annual membership: {formatCurrency(PRICING.membership.annual)}/year (2 months free!)
          </p>
        </div>
      </div>
    </section>
  );
}
