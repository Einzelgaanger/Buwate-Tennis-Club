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
  Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { CLUB_INFO } from '@/lib/constants';
import type { Database } from '@/integrations/supabase/types';

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

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center">
                <span className="text-sidebar-primary-foreground font-display font-bold">B</span>
              </div>
              <div>
                <p className="font-display font-bold text-sidebar-foreground">{CLUB_INFO.shortName}</p>
                <p className="text-xs text-sidebar-foreground/60">Tennis Club</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                <User className="w-5 h-5 text-sidebar-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-sidebar-foreground/60">{getRoleLabel()}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-background">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-sm">B</span>
            </div>
            <span className="font-display font-bold">{CLUB_INFO.shortName}</span>
          </Link>
          <div className="w-10" /> {/* Spacer for centering */}
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
