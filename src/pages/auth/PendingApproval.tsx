import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Clock, ArrowLeft, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { CLUB_INFO } from '@/lib/constants';

export default function PendingApproval() {
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If not a coach or already approved, redirect
    if (!user) {
      navigate('/auth');
      return;
    }

    if (role !== 'coach') {
      navigate('/member');
      return;
    }

    if (profile?.approval_status === 'approved') {
      navigate('/coach');
      return;
    }

    if (profile?.approval_status === 'rejected') {
      // Could show a different message for rejected
    }
  }, [user, role, profile, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-lg text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center">
          <Clock className="w-10 h-10 text-gold" />
        </div>
        
        <h1 className="font-display text-3xl font-bold mb-4">Application Under Review</h1>
        
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Thank you for applying to coach at {CLUB_INFO.name}! Your application is currently being reviewed by our admin team.
        </p>

        <div className="dashboard-card text-left mb-8">
          <h3 className="font-semibold mb-4">What happens next?</h3>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-medium">1</span>
              <span>Our admin team will review your application and qualifications.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-medium">2</span>
              <span>You'll receive an email notification once your application is approved.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-medium">3</span>
              <span>After approval, you can sign in and start setting your availability.</span>
            </li>
          </ol>
        </div>

        <div className="dashboard-card text-left mb-8">
          <h3 className="font-semibold mb-3">Need help?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            If you have questions about your application, please contact us:
          </p>
          <div className="space-y-2">
            <a 
              href={`tel:${CLUB_INFO.phones[0]}`} 
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Phone className="w-4 h-4" />
              {CLUB_INFO.phones[0]}
            </a>
            <a 
              href={`mailto:${CLUB_INFO.email}`} 
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Mail className="w-4 h-4" />
              {CLUB_INFO.email}
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={handleSignOut}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Sign out
          </Button>
          <Button asChild className="btn-primary">
            <Link to="/">Visit Homepage</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
