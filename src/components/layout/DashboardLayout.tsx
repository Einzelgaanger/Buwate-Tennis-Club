import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  CreditCard, 
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Clock,
  BarChart3,
  FileText,
  Shield,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { CLUB_INFO } from '@/lib/constants';
import type { Database } from '@/integrations/supabase/types';
import logoWhite from '@/assets/logo-white.jpeg';

type AppRole = Database['public']['Enums']['app_role'];

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const getNavItems = (role: AppRole | null): NavItem[] => {
  switch (role) {
    case 'admin':
      return [
        { href: '/admin', label: 'Overview', icon: LayoutDashboard },
        { href: '/admin/bookings', label: 'Bookings', icon: Calendar },
        { href: '/admin/members', label: 'Members', icon: Users },
        { href: '/admin/coaches', label: 'Coaches', icon: User },
        { href: '/admin/payments', label: 'Payments', icon: CreditCard },
        { href: '/admin/financials', label: 'Financials', icon: BarChart3 },
        { href: '/admin/courts', label: 'Courts', icon: FileText },
        { href: '/admin/admins', label: 'Admins', icon: Shield },
        { href: '/admin/settings', label: 'Settings', icon: Settings },
      ];
    case 'coach':
      return [
        { href: '/coach', label: 'Overview', icon: LayoutDashboard },
        { href: '/coach/availability', label: 'Availability', icon: Clock },
        { href: '/coach/sessions', label: 'Sessions', icon: Calendar },
        { href: '/coach/earnings', label: 'Earnings', icon: CreditCard },
        { href: '/profile', label: 'Profile', icon: User },
      ];
    default:
      return [
        { href: '/member', label: 'Overview', icon: LayoutDashboard },
        { href: '/member/bookings', label: 'My Bookings', icon: Calendar },
        { href: '/member/coaching', label: 'Coaching', icon: Users },
        { href: '/member/payments', label: 'Payments', icon: CreditCard },
        { href: '/profile', label: 'Profile', icon: User },
      ];
  }
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile, role, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = getNavItems(role);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'coach': return 'Coach';
      default: return 'Member';
    }
  };

  const getRoleBadgeClass = () => {
    switch (role) {
      case 'admin': return 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30';
      case 'coach': return 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-gradient-to-r from-sky-500/20 to-blue-500/20 text-sky-400 border-sky-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 
          transform transition-all duration-300 ease-out shadow-2xl
          lg:translate-x-0 lg:static
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Logo & Brand */}
          <div className="relative p-6 border-b border-white/5">
            <Link to="/" className="flex items-center gap-4 group">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-14 h-14 rounded-lg overflow-hidden shadow-lg shadow-primary/10"
              >
                <img src={logoWhite} alt="Buwate Tennis Club" className="w-full h-full object-cover" />
              </motion.div>
              <div>
                <p className="font-display font-bold text-white text-lg tracking-tight">{CLUB_INFO.shortName}</p>
                <p className="text-xs text-white/40 font-medium">Tennis Club</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.href;
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden
                      ${isActive 
                        ? 'bg-gradient-to-r from-primary/20 to-primary/5 text-white shadow-lg shadow-primary/5' 
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeNavIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-primary/50 rounded-r-full"
                      />
                    )}
                    <item.icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'text-primary' : 'group-hover:scale-110'}`} />
                    <span className="font-medium flex-1">{item.label}</span>
                    {isActive && (
                      <ChevronRight className="w-4 h-4 text-primary/60" />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="relative p-4 border-t border-white/5">
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/5">
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center ring-2 ring-white/10">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {profile?.full_name || 'User'}
                </p>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeClass()}`}>
                  <Sparkles className="w-3 h-3" />
                  {getRoleLabel()}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start text-white/50 hover:text-white hover:bg-white/5 rounded-xl"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2.5 rounded-xl hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg overflow-hidden">
              <img src={logoWhite} alt="BTC" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-bold text-lg">{CLUB_INFO.shortName}</span>
          </Link>
          <div className="w-10" /> {/* Spacer for centering */}
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
