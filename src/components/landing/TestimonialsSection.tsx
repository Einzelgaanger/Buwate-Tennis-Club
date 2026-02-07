import { Quote, Star } from 'lucide-react';
import clubTrophyCeremony from '@/assets/club-trophy-ceremony.jpg';
import playersHandshake from '@/assets/players-handshake.webp';
import trophyChampions from '@/assets/trophy-champions.webp';
import tournamentWinners from '@/assets/tournament-winners.webp';

const testimonials = [
  {
    content: "The clay courts at Buwate Tennis Club are exceptionally maintained. I've been a member for over a year and the experience keeps getting better! The coaching staff truly cares about your progress.",
    author: "Sarah Nakamya",
    role: "Club Member",
    image: playersHandshake,
    rating: 5,
  },
  {
    content: "Coach David transformed my serve in just a few sessions. The online booking system makes scheduling lessons so convenient. Best tennis club in Kampala hands down!",
    author: "Michael Kato",
    role: "Junior Player",
    image: trophyChampions,
    rating: 5,
  },
  {
    content: "Perfect family tennis destination. The kids love it here and the staff is incredibly welcoming. We play every weekend and it's become our favorite family activity.",
    author: "The Okello Family",
    role: "Family Members",
    image: clubTrophyCeremony,
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background with clearer image */}
      <div className="absolute inset-0 hero-gradient" />
      
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={tournamentWinners} 
          alt="Tennis community at Buwate Tennis Club" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/50 via-primary/40 to-primary/50" />
      </div>
      
      {/* Pattern overlay */}
      <div className="absolute inset-0 court-pattern opacity-10" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 text-gold font-semibold mb-2 text-xs uppercase tracking-wider">
            <Star className="w-3.5 h-3.5 fill-gold" />
            Testimonials
          </span>
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold mb-3 text-white">
            What Our Members{' '}
            <span className="hero-text-gradient">Say About Us</span>
          </h2>
          <p className="text-sm text-white/80">
            Join hundreds of happy members who have made Buwate Tennis Club their tennis home.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-5 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="glass-card p-5 group hover:bg-white/20 transition-all duration-300"
            >
              {/* Quote Icon */}
              <div className="mb-3">
                <Quote className="w-8 h-8 text-gold/50" />
              </div>

              {/* Rating */}
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <div key={i}>
                    <Star className="w-4 h-4 text-gold fill-gold" />
                  </div>
                ))}
              </div>

              {/* Content */}
              <p className="text-white/90 leading-relaxed mb-4 text-sm">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-gold/40 shrink-0">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.author}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-display font-semibold text-white text-sm">{testimonial.author}</p>
                  <p className="text-xs text-white/70">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="mt-10 glass-card p-5 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
            {[
              { value: '100+', label: 'Active Members' },
              { value: '500+', label: 'Monthly Sessions' },
              { value: '4.9', label: 'Average Rating' },
              { value: '2+', label: 'Years of Excellence' },
            ].map((stat, index) => (
              <div key={index}>
                <p className="font-display text-2xl md:text-3xl font-bold text-gold mb-1">
                  {stat.value}
                </p>
                <p className="text-white/80 text-xs md:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
