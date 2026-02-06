import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, Loader2, Sparkles, Users, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CLUB_INFO } from '@/lib/constants';
import heroCourtImage from '@/assets/hero-court.jpg';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'signin' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  );
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'member' | 'coach'>('member');

  const { signIn, signUp, user, role: userRole, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && userRole) {
      if (userRole === 'coach' && profile?.approval_status === 'pending') {
        navigate('/auth/pending-approval');
        return;
      }
      
      if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'coach') {
        navigate('/coach');
      } else {
        navigate('/member');
      }
    }
  }, [user, userRole, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }
        if (!/[A-Z]/.test(password)) {
          throw new Error('Password must contain at least one uppercase letter');
        }
        if (!/[0-9]/.test(password)) {
          throw new Error('Password must contain at least one number');
        }

        const { error } = await signUp(email, password, fullName, selectedRole);
        if (error) throw error;

        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-8 lg:p-12 bg-background">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Back Link */}
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to home
          </Link>

          {/* Header */}
          <div className="mb-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 bg-accent/10 rounded-full px-4 py-1.5 mb-4"
            >
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">
                {mode === 'signin' ? 'Welcome back' : 'Join us today'}
              </span>
            </motion.div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
              {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
            </h1>
            <p className="text-muted-foreground">
              {mode === 'signin' 
                ? 'Access your dashboard and book courts'
                : 'Start your tennis journey at BTC'
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="input-premium"
                  maxLength={100}
                />
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-premium"
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={mode === 'signup' ? 'Min 8 chars, 1 uppercase, 1 number' : '••••••••'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-premium pr-12"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {mode === 'signin' && (
                <div className="text-right">
                  <Link
                    to="/auth/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}
            </div>

            {mode === 'signup' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                <Label className="text-sm font-medium">I want to</Label>
                <RadioGroup value={selectedRole} onValueChange={(v) => setSelectedRole(v as 'member' | 'coach')}>
                  <div className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedRole === 'member' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}>
                    <RadioGroupItem value="member" id="member" />
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <Label htmlFor="member" className="cursor-pointer flex-1">
                      <span className="font-semibold text-base">Play Tennis</span>
                      <p className="text-sm text-muted-foreground">Book courts and take lessons</p>
                    </Label>
                  </div>
                  <div className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedRole === 'coach' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}>
                    <RadioGroupItem value="coach" id="coach" />
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-accent" />
                    </div>
                    <Label htmlFor="coach" className="cursor-pointer flex-1">
                      <span className="font-semibold text-base">Coach Players</span>
                      <p className="text-sm text-muted-foreground">Offer coaching sessions</p>
                    </Label>
                  </div>
                </RadioGroup>
              </motion.div>
            )}

            <Button type="submit" className="w-full btn-primary rounded-xl py-6 text-lg mt-6" disabled={loading}>
              {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          {/* Toggle Mode */}
          <p className="mt-8 text-center text-muted-foreground">
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('signin')}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </motion.div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Background Image */}
        <img 
          src={heroCourtImage} 
          alt="Clay tennis court at sunset" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-primary/70" />
        <div className="absolute inset-0 court-pattern opacity-15" />
        
        {/* Decorative Elements */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gold/25 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative z-10 flex items-center justify-center p-12 w-full"
        >
          <div className="text-center text-primary-foreground max-w-lg">
            <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gold flex items-center justify-center shadow-2xl">
              <span className="text-gold-foreground font-display font-bold text-5xl">B</span>
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold mb-4">{CLUB_INFO.name}</h2>
            <p className="text-xl opacity-85 mb-10">Your Tennis Journey Starts Here</p>
            
            <div className="grid grid-cols-3 gap-6">
              {[
                { value: '2', label: 'Clay Courts' },
                { value: '2', label: 'Pro Coaches' },
                { value: '14h', label: 'Daily Open' },
              ].map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <p className="font-display text-2xl font-bold text-gold">{stat.value}</p>
                  <p className="text-sm opacity-75">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
