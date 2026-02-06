import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, Loader2, Sparkles, Users, GraduationCap, Calendar, Award, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CLUB_INFO } from '@/lib/constants';
import heroCourtImage from '@/assets/hero-court.jpg';
import logoBlack from '@/assets/logo-black.jpeg';
import logoWhite from '@/assets/logo-white.jpeg';

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
      <div className="flex-1 flex items-center justify-center p-6 md:p-8 lg:p-12 bg-background relative overflow-hidden">
        {/* Background decorations */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-20 left-20 w-48 h-48 bg-accent/20 rounded-full blur-3xl"
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Logo & Back Link */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex items-center justify-between mb-8"
          >
            <Link to="/" className="flex items-center gap-3">
              <img 
                src={logoBlack} 
                alt="Buwate Tennis Club" 
                className="h-12 w-auto object-contain"
              />
            </Link>
            <Link 
              to="/" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to home
            </Link>
          </motion.div>

          {/* Header */}
          <div className="mb-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 bg-accent/10 rounded-full px-4 py-1.5 mb-4"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="w-4 h-4 text-accent" />
              </motion.div>
              <span className="text-sm font-medium text-accent">
                {mode === 'signin' ? 'Welcome back' : 'Join us today'}
              </span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="font-display text-3xl md:text-4xl font-bold mb-3"
            >
              {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-muted-foreground"
            >
              {mode === 'signin' 
                ? 'Access your dashboard and book courts'
                : 'Start your tennis journey at Buwate Tennis Club'
              }
            </motion.p>
          </div>

          {/* Form */}
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
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
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedRole === 'member' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="member" id="member" />
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <Label htmlFor="member" className="cursor-pointer flex-1">
                      <span className="font-semibold text-base">Play Tennis</span>
                      <p className="text-sm text-muted-foreground">Book courts and take lessons</p>
                    </Label>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedRole === 'coach' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="coach" id="coach" />
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-accent" />
                    </div>
                    <Label htmlFor="coach" className="cursor-pointer flex-1">
                      <span className="font-semibold text-base">Coach Players</span>
                      <p className="text-sm text-muted-foreground">Offer coaching sessions</p>
                    </Label>
                  </motion.div>
                </RadioGroup>
              </motion.div>
            )}

            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Button type="submit" className="w-full btn-primary rounded-xl py-6 text-lg mt-6" disabled={loading}>
                {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </Button>
            </motion.div>
          </motion.form>

          {/* Toggle Mode */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-8 text-center text-muted-foreground"
          >
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
          </motion.p>
        </motion.div>
      </div>

      {/* Right Side - Branding with clearer image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Background Image - clearer with less overlay */}
        <motion.img 
          src={heroCourtImage} 
          alt="Clay tennis court at sunset" 
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        {/* Lighter overlay for better image visibility */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/75 via-primary/65 to-primary/55" />
        
        {/* Animated pattern overlay - more subtle */}
        <motion.div 
          animate={{ 
            backgroundPosition: ["0% 0%", "100% 100%"]
          }}
          transition={{ duration: 30, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 court-pattern opacity-10" 
        />
        
        {/* Floating Decorative Elements */}
        <motion.div 
          animate={{ 
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-gold/30 rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ 
            y: [0, 20, 0],
            scale: [1.1, 1, 1.1],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-accent/25 rounded-full blur-3xl" 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative z-10 flex items-center justify-center p-12 w-full"
        >
          <div className="text-center text-primary-foreground max-w-lg">
            {/* Logo */}
            <motion.div 
              className="mb-8"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
            >
              <img 
                src={logoWhite} 
                alt="Buwate Tennis Club" 
                className="h-24 w-auto object-contain mx-auto"
              />
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="font-display text-4xl lg:text-5xl font-bold mb-4"
            >
              {CLUB_INFO.name}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-xl opacity-90 mb-10"
            >
              Your Tennis Journey Starts Here
            </motion.p>
            
            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="grid grid-cols-3 gap-4"
            >
              {[
                { icon: Calendar, value: '2', label: 'Clay Courts' },
                { icon: Award, value: '2', label: 'Pro Coaches' },
                { icon: Star, value: '4.9', label: 'Rating' },
              ].map((stat, index) => (
                <motion.div 
                  key={index} 
                  className="bg-white/15 backdrop-blur-sm rounded-2xl p-4"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <stat.icon className="w-5 h-5 text-gold mx-auto mb-2" />
                  <p className="font-display text-2xl font-bold text-gold">{stat.value}</p>
                  <p className="text-sm opacity-80">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
