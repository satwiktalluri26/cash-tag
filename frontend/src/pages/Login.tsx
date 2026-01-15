import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { Tag, TrendingUp, Wallet, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useApp();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoResponse.json();

        login(
          {
            name: userInfo.name,
            email: userInfo.email,
            avatar: userInfo.picture,
          },
          tokenResponse.access_token
        );

        toast.success('Signed in successfully!');
        navigate('/connect');
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        toast.error('Failed to get user information from Google');
      }
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      toast.error('Google Sign-In failed');
    },
    scope: 'https://www.googleapis.com/auth/spreadsheets',
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8 animate-fade-in">
          {/* Logo & Tagline */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-2">
              <Tag className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              CashTag
            </h1>
            <p className="text-lg text-muted-foreground">
              Tag it. Track it. Control it.
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-2 py-4">
            <FeaturePill icon={TrendingUp} label="Track spending" />
            <FeaturePill icon={Wallet} label="Multiple accounts" />
            <FeaturePill icon={Shield} label="Your data, your sheets" />
          </div>

          {/* Login Button */}
          <div className="space-y-4 pt-4">
            <Button
              variant="google"
              size="xl"
              className="w-full"
              onClick={() => handleGoogleLogin()}
            >
              <GoogleIcon />
              Sign in with Google
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Connect your Google Sheet as a personal database
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>See where your money goes</p>
      </footer>
    </div>
  );
}

function FeaturePill({ icon: Icon, label }: { icon: typeof TrendingUp; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
      <Icon className="w-4 h-4" />
      {label}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
