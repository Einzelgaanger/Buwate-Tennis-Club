import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import PendingApproval from "./pages/auth/PendingApproval";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

// Member Pages
import MemberDashboard from "./pages/member/MemberDashboard";
import MemberBookings from "./pages/member/MemberBookings";
import MemberCoaching from "./pages/member/MemberCoaching";
import MemberPayments from "./pages/member/MemberPayments";

// Coach Pages
import CoachDashboard from "./pages/coach/CoachDashboard";
import CoachAvailability from "./pages/coach/CoachAvailability";
import CoachSessions from "./pages/coach/CoachSessions";
import CoachEarnings from "./pages/coach/CoachEarnings";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminMembers from "./pages/admin/AdminMembers";
import AdminCoaches from "./pages/admin/AdminCoaches";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminFinancials from "./pages/admin/AdminFinancials";
import AdminCourts from "./pages/admin/AdminCourts";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminAdmins from "./pages/admin/AdminAdmins";
import { AIAssistant } from "./components/ai/AIAssistant";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/auth/pending-approval" element={<PendingApproval />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected Routes - Profile */}
            <Route path="/profile" element={<Profile />} />
            
            {/* Member Routes */}
            <Route path="/member" element={<MemberDashboard />} />
            <Route path="/member/bookings" element={<MemberBookings />} />
            <Route path="/member/coaching" element={<MemberCoaching />} />
            <Route path="/member/payments" element={<MemberPayments />} />
            
            {/* Coach Routes */}
            <Route path="/coach" element={<CoachDashboard />} />
            <Route path="/coach/availability" element={<CoachAvailability />} />
            <Route path="/coach/sessions" element={<CoachSessions />} />
            <Route path="/coach/earnings" element={<CoachEarnings />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/members" element={<AdminMembers />} />
            <Route path="/admin/coaches" element={<AdminCoaches />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/financials" element={<AdminFinancials />} />
            <Route path="/admin/courts" element={<AdminCourts />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/admins" element={<AdminAdmins />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <AIAssistant />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
