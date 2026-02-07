import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { CLUB_INFO } from '@/lib/constants';
import logoWhite from '@/assets/logo-white.jpeg';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getDashboardLink = () => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'coach':
        return '/coach';
      default:
        return '/member';
    }
  };

  const navLinks = [
    { href: '/#features', label: 'Features' },
    { href: '/#pricing', label: 'Pricing' },
    { href: '/#about', label: 'About' },
    { href: '/#contact', label: 'Contact' },
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-transparent"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-18 md:h-20">
          {/* Logo */}
          <Link to="/" className="relative group mt-[140px]">
            <div className="h-40 w-40 rounded-lg overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-xl">
              <img 
                src={logoWhite} 
                alt="Buwate Tennis Club" 
                className="h-full w-full object-cover transition-all duration-300"
              />
            </div>
            <div className="hidden sm:block absolute top-4 right-0 translate-x-full pl-3">
              <p className="font-display font-bold text-3xl leading-tight text-white">Buwate</p>
              <p className="font-display font-bold text-3xl leading-tight text-white whitespace-nowrap">Tennis Club</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-colors link-underline text-white/80 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 rounded-xl text-white hover:bg-white/10">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/20">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">{profile?.full_name?.split(' ')[0] || 'Account'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-xl p-2">
                  <DropdownMenuItem asChild className="rounded-lg">
                    <Link to={getDashboardLink()} className="cursor-pointer flex items-center justify-between">
                      Dashboard
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg">
                    <Link to="/profile" className="cursor-pointer flex items-center justify-between">
                      My Profile
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer rounded-lg">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild className="rounded-xl text-white hover:bg-white/10">
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild className="btn-gold rounded-xl px-6">
                  <Link to="/auth?mode=signup">Join Club</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl transition-colors hover:bg-white/10"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-background border-t border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block py-3 text-foreground font-medium hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 border-t border-border space-y-3">
                {user ? (
                  <>
                    <Button variant="outline" asChild className="w-full rounded-xl">
                      <Link to={getDashboardLink()}>Dashboard</Link>
                    </Button>
                    <Button variant="ghost" onClick={handleSignOut} className="w-full text-destructive rounded-xl">
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild className="w-full rounded-xl">
                      <Link to="/auth">Sign In</Link>
                    </Button>
                    <Button asChild className="w-full btn-gold rounded-xl">
                      <Link to="/auth?mode=signup">Join Club</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
