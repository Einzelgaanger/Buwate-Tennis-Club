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
  ChevronRight
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
        // { href: '/admin/financials', label: 'Financials', icon: BarChart3 }, // Hidden - access via /admin/financials
        { href: '/admin/courts', label: 'Courts', icon: FileText },
        { href: '/admin/admins', label: 'Admins', icon: Shield },
        // { href: '/admin/settings', label: 'Settings', icon: Settings }, // Hidden - access via /admin/settings
      ];
    case 'coach':
      return [
        { href: '/coach', label: 'Overview', icon: LayoutDashboard },
        { href: '/coach/availability', label: 'Availability', icon: Clock },
        { href: '/coach/sessions', label: 'Sessions', icon: Calendar },
        // { href: '/coach/earnings', label: 'Earnings', icon: CreditCard }, // Hidden - access via /coach/earnings
        { href: '/profile', label: 'Profile', icon: User },
      ];
    default:
      return [
        { href: '/member', label: 'Overview', icon: LayoutDashboard },
        { href: '/member/bookings', label: 'My Bookings', icon: Calendar },
        { href: '/member/coaching', label: 'Coaching', icon: Users },
        { href: '/member/payments', label: 'Payments', icon: CreditCard },
        { href: '/member/statement', label: 'Statement', icon: FileText },
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
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
      {/* Sidebar - fixed height, no scroll */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 h-screen bg-black
          transform transition-all duration-300 ease-out shadow-2xl
          lg:translate-x-0 lg:static lg:h-full
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full relative overflow-hidden">
          {/* Logo & Brand */}
          <div className="relative flex-shrink-0 p-4 lg:p-5 border-b border-white/10">
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

          {/* Navigation - flex-1 min-h-0 so it takes remaining space without scrolling */}
          <nav className="flex-1 min-h-0 overflow-hidden p-3 lg:p-4 flex flex-col">
            <div className="space-y-0.5">
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
                      group flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 relative overflow-hidden
                      ${isActive 
                        ? 'bg-[#047857] text-white border-l-4 border-[#10b981] shadow-lg shadow-emerald-900/30' 
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    <item.icon className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isActive ? 'text-white' : 'group-hover:scale-110'}`} />
                    <span className="font-medium flex-1 text-sm truncate">{item.label}</span>
                    {isActive && (
                      <ChevronRight className="w-4 h-4 shrink-0 text-white" />
                    )}
                  </Link>
                </motion.div>
              );
              })}
            </div>
          </nav>

          {/* User Info - always visible at bottom */}
          <div className="relative flex-shrink-0 p-3 lg:p-4 border-t border-white/10">
            <div className="flex items-center gap-2.5 mb-3 p-2.5 rounded-xl bg-white/5">
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-lg bg-[#047857]/35 flex items-center justify-center ring-2 ring-[#10b981]/50">
                  <User className="w-4 h-4 text-[#10b981]" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#10b981] rounded-full border-2 border-black" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {profile?.full_name || 'User'}
                </p>
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${getRoleBadgeClass()}`}>
                  {getRoleLabel()}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="w-full justify-start text-white/50 hover:text-white hover:bg-white/5 rounded-lg text-sm h-8"
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
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

      {/* Main Content - only this area scrolls */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex-shrink-0 flex items-center justify-between p-4 border-b border-border/50 bg-background/80 backdrop-blur-xl z-30">
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

        {/* Page Content - only scrollable area */}
        <main className="flex-1 min-h-0 overflow-auto p-4 md:p-6 lg:p-8">
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
