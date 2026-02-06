import { Quote } from 'lucide-react';

const testimonials = [
  {
    content: "The clay courts at BTC are exceptionally maintained. I've been a member for a year and the experience keeps getting better!",
    author: "Sarah M.",
    role: "Club Member",
  },
  {
    content: "Coach David transformed my serve in just a few sessions. The online booking system makes scheduling lessons so convenient.",
    author: "Michael K.",
    role: "Junior Player",
  },
  {
    content: "Perfect family tennis destination. The kids love it here and the staff is incredibly welcoming.",
    author: "The Okello Family",
    role: "Family Members",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-gold font-semibold mb-3">Testimonials</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            What Our Members Say
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="glass-card p-8"
            >
              <Quote className="w-10 h-10 text-gold/50 mb-4" />
              <p className="text-primary-foreground/90 leading-relaxed mb-6">
                "{testimonial.content}"
              </p>
              <div>
                <p className="font-semibold">{testimonial.author}</p>
                <p className="text-sm text-primary-foreground/60">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
