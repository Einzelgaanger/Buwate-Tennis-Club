import { useState, useRef, useEffect } from 'react';
import { Calendar, Users, CreditCard, Clock, Shield, Smartphone, Sun, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import coachingImage from '@/assets/coaching-session.jpg';
import courtsAerialImage from '@/assets/courts-aerial.jpg';

const features = [
  {
    icon: Calendar,
    title: 'Instant Court Booking',
    description: 'Book your preferred court and time slot in seconds with real-time availability and instant confirmation.',
    image: 'https://images.unsplash.com/photo-1622163642999-8f51642816b9?w=400&h=300&fit=crop&q=80&auto=format',
  },
  {
    icon: Users,
    title: 'Expert Coaching',
    description: 'Learn from certified coaches with private, semi-private, and group session options for all skill levels.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&q=80',
  },
  {
    icon: CreditCard,
    title: 'Mobile Money Payments',
    description: 'Secure and convenient payments via Mobile Money. No cash handling, instant verification.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop&q=80',
  },
  {
    icon: Clock,
    title: 'Flexible Hours',
    description: 'Open from 8 AM to 10 PM daily with floodlit courts for evening play. Play when it suits you.',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop&q=80',
  },
  {
    icon: Shield,
    title: 'Member Benefits',
    description: 'Exclusive rates, priority booking, family packages, and unlimited play options for members.',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop&q=80',
  },
  {
    icon: Smartphone,
    title: 'Manage Online',
    description: 'Track bookings, payments, and membership status. Everything at your fingertips.',
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop&q=80',
  },
];

export function FeaturesSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const offset = e.clientX - startX;
        setDragOffset(offset);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        const threshold = 100; // Minimum drag distance to trigger swipe
        
        if (Math.abs(dragOffset) > threshold) {
          if (dragOffset > 0 && activeIndex > 0) {
            // Swipe right - go to previous
            setActiveIndex(prev => prev - 1);
          } else if (dragOffset < 0 && activeIndex < features.length - 1) {
            // Swipe left - go to next
            setActiveIndex(prev => prev + 1);
          }
        }
        
        setIsDragging(false);
        setDragOffset(0);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        const offset = e.touches[0].clientX - startX;
        setDragOffset(offset);
      }
    };

    const handleTouchEnd = () => {
      if (isDragging) {
        const threshold = 100;
        
        if (Math.abs(dragOffset) > threshold) {
          if (dragOffset > 0 && activeIndex > 0) {
            setActiveIndex(prev => prev - 1);
          } else if (dragOffset < 0 && activeIndex < features.length - 1) {
            setActiveIndex(prev => prev + 1);
          }
        }
        
        setIsDragging(false);
        setDragOffset(0);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, startX, dragOffset, activeIndex]);

  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches[0]) {
      handleDragStart(e.touches[0].clientX);
    }
  };

  return (
    <section 
      id="features" 
      className="py-24 lg:py-32 relative overflow-hidden rounded-t-[4rem] -mt-16 z-10"
    >
      {/* Creative Background with gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-secondary rounded-t-[4rem]" />
      
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 bg-dots opacity-60 rounded-t-[4rem]"
        style={{ backgroundSize: "30px 30px" }}
      />
      
      <div className="container mx-auto px-4 relative pt-2">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-flex items-center gap-2 text-accent font-semibold mb-4 text-sm uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            Why Choose Us
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
            Everything You Need for Your{' '}
            <span className="text-gradient-clay">Tennis Journey</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            From professional courts to expert coaching, we provide a complete tennis experience 
            designed for players of all levels.
          </p>
        </div>

        {/* Image + Features Layout */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Image Stack */}
          <div className="relative">
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-elegant">
                <img 
                  src={courtsAerialImage} 
                  alt="Aerial view of clay tennis courts" 
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>
              
              {/* Overlapping Image */}
              <div className="absolute -bottom-8 -right-8 w-2/3 rounded-2xl overflow-hidden shadow-2xl border-4 border-background">
                <img 
                  src={coachingImage} 
                  alt="Professional coaching session" 
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>
            </div>
          </div>

          {/* Tinder-style Card Stack */}
          <div className="relative w-full h-[500px] flex items-center justify-center">
            <div className="relative w-full max-w-md h-[480px]">
              {features.map((feature, index) => {
                // Show cards that are at or below the active index (stacked)
                if (index < activeIndex) {
                  return null; // Hide cards that have been swiped away
                }
                
                const isTopCard = index === activeIndex;
                const stackOffset = index - activeIndex;
                const scale = 1 - (stackOffset * 0.05); // Each card behind is slightly smaller
                const yOffset = stackOffset * 10; // Each card behind is slightly lower
                const opacity = 1 - (stackOffset * 0.2); // Each card behind is slightly more transparent
                const zIndex = features.length - index; // Higher index = higher z-index
                
                // Calculate rotation based on drag
                const rotation = isTopCard && isDragging ? (dragOffset / 20) : 0;
                const translateX = isTopCard ? dragOffset : 0;
                
                return (
                  <div
                    key={index}
                    ref={isTopCard ? cardRef : null}
                    className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[380px] h-[480px] flex flex-col overflow-hidden bg-background rounded-3xl shadow-lg border border-border ${
                      isTopCard ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'
                    }`}
                    style={{
                      transform: `translateX(calc(-50% + ${translateX}px)) translateY(${yOffset}px) scale(${scale}) rotate(${rotation}deg)`,
                      opacity: opacity,
                      zIndex: zIndex,
                      transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                    }}
                    onMouseDown={isTopCard ? handleMouseDown : undefined}
                    onTouchStart={isTopCard ? handleTouchStart : undefined}
                  >
                    <div className="w-full h-48 mb-4 rounded-t-3xl overflow-hidden bg-muted">
                      <img 
                        src={feature.image} 
                        alt={feature.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=400&h=300&fit=crop&q=80';
                        }}
                      />
                    </div>
                    <div className="px-6 pb-6 flex flex-col flex-1">
                      <h3 className="font-display text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed text-sm flex-1">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Back / Front buttons + Indicator Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
              <button
                type="button"
                onClick={() => {
                  setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
                  setDragOffset(0);
                }}
                disabled={activeIndex === 0}
                className="p-2.5 rounded-full bg-background/90 border border-border shadow-md hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <div className="flex gap-2">
                {features.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setActiveIndex(index);
                      setDragOffset(0);
                    }}
                    className={`h-2 rounded-full ${
                      index === activeIndex 
                        ? 'bg-primary w-6' 
                        : 'bg-muted-foreground/30 w-2'
                    }`}
                    aria-label={`Go to feature ${index + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveIndex(prev => (prev < features.length - 1 ? prev + 1 : prev));
                  setDragOffset(0);
                }}
                disabled={activeIndex === features.length - 1}
                className="p-2.5 rounded-full bg-background/90 border border-border shadow-md hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
