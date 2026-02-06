import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Check, Star, Sparkles, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, PRICING } from '@/lib/constants';
import { useRef } from 'react';

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
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 });

  return (
    <section ref={sectionRef} id="pricing" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Creative Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/50 to-background" />
      
      {/* Animated grid pattern */}
      <motion.div 
        animate={{ 
          backgroundPosition: isInView ? ["0% 0%", "100% 100%"] : "0% 0%"
        }}
        transition={{ duration: 25, repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0 bg-grid opacity-40"
      />
      
      {/* Floating decorative elements */}
      <motion.div 
        animate={{ y: [0, -50, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl"
      />
      <motion.div 
        animate={{ y: [0, 40, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl"
      />

      <div className="container mx-auto px-4 relative">
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
            className="inline-flex items-center gap-2 text-accent font-semibold mb-4 text-sm uppercase tracking-wider"
          >
            <Star className="w-4 h-4" />
            Pricing Plans
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
          >
            Simple,{' '}
            <span className="text-gradient-gold">Transparent</span>{' '}
            Pricing
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-lg text-muted-foreground"
          >
            Choose the plan that fits your playing style. All prices in Ugandan Shillings (UGX).
          </motion.p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ delay: 0.2 + index * 0.12, duration: 0.7 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`pricing-card ${plan.featured ? 'featured ring-2 ring-accent/50' : ''} flex flex-col relative group`}
            >
              {plan.badge && (
                <motion.div 
                  className="absolute -top-4 left-1/2 -translate-x-1/2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <span className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {plan.badge}
                  </span>
                </motion.div>
              )}

              {/* Icon */}
              <motion.div 
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${plan.featured ? 'bg-accent/10' : 'bg-primary/10'}`}
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <plan.icon className={`w-7 h-7 ${plan.featured ? 'text-accent' : 'text-primary'}`} />
              </motion.div>
              
              <h3 className="font-display text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground mb-6">{plan.description}</p>
              
              <div className="mb-8">
                <motion.span 
                  className="font-display text-4xl md:text-5xl font-bold"
                  animate={isInView && plan.featured ? { 
                    color: ["hsl(var(--foreground))", "hsl(var(--gold))", "hsl(var(--foreground))"]
                  } : {}}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {formatCurrency(plan.price)}
                </motion.span>
                <span className="text-muted-foreground text-lg">{plan.priceLabel}</span>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, featureIndex) => (
                  <motion.li 
                    key={featureIndex} 
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    transition={{ delay: 0.4 + index * 0.1 + featureIndex * 0.05, duration: 0.3 }}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.featured ? 'bg-accent/10' : 'bg-primary/10'}`}>
                      <Check className={`w-3 h-3 ${plan.featured ? 'text-accent' : 'text-primary'}`} />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </motion.li>
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
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-16 text-center space-y-3"
        >
          <p className="text-muted-foreground">
            One-time registration fee: <span className="font-semibold text-foreground">{formatCurrency(PRICING.membership.registration)}</span>
          </p>
          <p className="text-muted-foreground">
            Save more with annual membership: <span className="font-semibold text-foreground">{formatCurrency(PRICING.membership.annual)}/year</span>{' '}
            <span className="text-accent font-medium">(2 months free!)</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
