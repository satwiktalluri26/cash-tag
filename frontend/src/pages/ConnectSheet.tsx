import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';
import { FileSpreadsheet, Link2, CheckCircle2, Loader2 } from 'lucide-react';

export default function ConnectSheet() {
  const navigate = useNavigate();
  const { connectSheet } = useApp();
  const [sheetUrl, setSheetUrl] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [step, setStep] = useState<'input' | 'validating' | 'success'>('input');

  const handleConnect = async () => {
    if (!sheetUrl.trim()) return;
    
    setIsConnecting(true);
    setStep('validating');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setStep('success');
    connectSheet(sheetUrl);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    navigate('/dashboard');
  };

  const handleSkipDemo = () => {
    connectSheet('demo');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        {step === 'input' && (
          <>
            {/* Icon */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-income/10">
                <FileSpreadsheet className="w-8 h-8 text-income" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Connect Your Sheet
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Paste your Google Sheet URL to use it as your personal finance database
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              
              <Button
                size="lg"
                className="w-full"
                onClick={handleConnect}
                disabled={!sheetUrl.trim()}
              >
                Connect Sheet
              </Button>
            </div>

            {/* Help text */}
            <div className="space-y-4 pt-4">
              <div className="h-px bg-border" />
              <p className="text-center text-sm text-muted-foreground">
                Don't have a sheet ready?
              </p>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleSkipDemo}
              >
                Try with demo data
              </Button>
            </div>
          </>
        )}

        {step === 'validating' && (
          <div className="text-center space-y-4 py-12">
            <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Validating Sheet
              </h2>
              <p className="mt-2 text-muted-foreground">
                Checking for required sheets...
              </p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4 py-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-income/10">
              <CheckCircle2 className="w-10 h-10 text-income" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Connected!
              </h2>
              <p className="mt-2 text-muted-foreground">
                Redirecting to your dashboard...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
