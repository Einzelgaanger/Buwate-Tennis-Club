import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CLUB_INFO } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

export function ContactSection() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message sent!",
      description: "We'll get back to you as soon as possible.",
    });
    
    setLoading(false);
    (e.target as HTMLFormElement).reset();
  };

  const contactInfo = [
    {
      icon: Phone,
      label: 'Phone',
      values: CLUB_INFO.phones,
    },
    {
      icon: Mail,
      label: 'Email',
      values: [CLUB_INFO.email],
    },
    {
      icon: MapPin,
      label: 'Location',
      values: [CLUB_INFO.location],
    },
    {
      icon: Clock,
      label: 'Hours',
      values: [CLUB_INFO.operatingHours],
    },
  ];

  return (
    <section id="contact" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Creative Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid opacity-40" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 text-accent font-semibold mb-4 text-sm uppercase tracking-wider">
            <MessageCircle className="w-4 h-4" />
            Get in Touch
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Ready to Start{' '}
            <span className="text-gradient-clay">Playing?</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Have questions? We'd love to hear from you. Send us a message or visit us at the club.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="bg-card rounded-3xl p-8 md:p-10 border border-border/50 shadow-elegant">
            <h3 className="font-display text-2xl font-bold mb-8">Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="Your name" 
                    required 
                    className="input-premium"
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    type="tel" 
                    placeholder="+256 XXX XXX XXX" 
                    className="input-premium"
                    maxLength={20}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  required 
                  className="input-premium"
                  maxLength={255}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="How can we help you?"
                  rows={5}
                  required
                  className="input-premium resize-none"
                  maxLength={1000}
                />
              </div>
              <div>
                <Button type="submit" className="w-full btn-primary rounded-xl py-6 text-lg" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                  <Send className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <h3 className="font-display text-2xl font-bold">Contact Information</h3>
            
            <div className="space-y-5">
              {contactInfo.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">{item.label}</p>
                    {item.values.map((value, vIndex) => (
                      <p key={vIndex} className="text-muted-foreground">{value}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Map Placeholder */}
            <div className="mt-8">
              <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 to-gold/10 flex items-center justify-center border border-border/50 overflow-hidden">
                <div className="text-center p-8">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-display font-semibold text-lg mb-2">Find Us in Buwate</p>
                  <p className="text-muted-foreground text-sm">Just off the Kampala-Gayaza Road</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
