import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { CashTagDB } from '@/lib/cashTagDB';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle2, AlertCircle, Database } from 'lucide-react';
import { toast } from 'sonner';

export default function InitializeSheet() {
    const navigate = useNavigate();
    const { accessToken, connectSheet, isAuthenticated } = useApp();
    const [status, setStatus] = useState<'searching' | 'creating' | 'error' | 'success'>('searching');
    const [message, setMessage] = useState('Checking for existing database...');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const initializationStarted = useRef(false);

    useEffect(() => {
        if (!isAuthenticated || !accessToken) {
            navigate('/');
            return;
        }

        if (!initializationStarted.current) {
            initializationStarted.current = true;
            startFlow();
        }
    }, [accessToken, isAuthenticated, navigate]);

    const startFlow = async () => {
        if (!accessToken) return;

        const db = new CashTagDB(accessToken);

        try {
            setStatus('searching');
            setMessage('Searching for cash-tag-db.csv in your Drive...');
            setProgress(10);

            const existingId = await db.checkDatabaseExists();

            if (existingId) {
                setMessage('Found existing database! Verifying...');
                setProgress(50);
                const isValid = await db.verifyDatabase(existingId);

                if (isValid) {
                    setProgress(100);
                    setStatus('success');
                    setMessage('Database verified!');
                    complete(existingId, db.getSpreadsheetUrl(existingId));
                    return;
                } else {
                    // If invalid, maybe we should offer to fix it? 
                    // For now, let's just proceed to create a new one or error out.
                    console.warn('Existing database found but verification failed.');
                }
            }

            // Not found or invalid, start creation
            setStatus('creating');
            setMessage('Initializing a new database...');
            setProgress(0);

            const newId = await db.initializeDatabase((step, currentProgress) => {
                setMessage(step);
                setProgress(currentProgress);
            });

            setStatus('success');
            setMessage('Database created successfully!');
            complete(newId, db.getSpreadsheetUrl(newId));
        } catch (err: any) {
            console.error('Initialization error:', err);
            setStatus('error');
            setError(err.message || 'An unexpected error occurred during setup.');
            toast.error('Failed to set up database');
        }
    };

    const complete = (id: string, url: string) => {
        connectSheet(id, url);
        setTimeout(() => {
            toast.success('Database ready!');
            navigate('/dashboard');
        }, 1500);
    };

    const handleRetry = () => {
        setError(null);
        setStatus('searching');
        setProgress(0);
        initializationStarted.current = false;
        startFlow();
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <Card className="w-full max-w-md border-2">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Database className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Sheet Setup</CardTitle>
                    <CardDescription>
                        {status === 'searching' && 'Looking for your database...'}
                        {status === 'creating' && 'Setting up your Google Sheets database'}
                        {status === 'error' && 'Something went wrong'}
                        {status === 'success' && 'Setup complete!'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-muted-foreground truncate mr-2">{message}</span>
                            <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>

                    <div className="flex flex-col items-center justify-center py-4">
                        {status === 'searching' || status === 'creating' ? (
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        ) : status === 'success' ? (
                            <CheckCircle2 className="w-12 h-12 text-primary" />
                        ) : (
                            <AlertCircle className="w-12 h-12 text-destructive" />
                        )}
                    </div>

                    {error && (
                        <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20 whitespace-pre-wrap">
                            {error}
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    {status === 'error' && (
                        <Button className="w-full" onClick={handleRetry}>
                            <Loader2 className="mr-2 h-4 w-4 hidden" />
                            Retry Setup
                        </Button>
                    )}
                    {status === 'success' && (
                        <Button className="w-full" disabled>
                            Redirecting...
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
