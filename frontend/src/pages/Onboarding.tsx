import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Plus, UserPlus, Wallet, Tag, ArrowRight, SkipForward, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Step = 'welcome' | 'sources' | 'categories' | 'people' | 'complete';

const COMMON_CATEGORIES = [
    { name: 'Food & Dining', emoji: '🍔' },
    { name: 'Groceries', emoji: '🛒' },
    { name: 'Shopping', emoji: '🛍️' },
    { name: 'Transport', emoji: '🚗' },
    { name: 'Bills & Utilities', emoji: '⚡' },
    { name: 'Entertainment', emoji: '🎬' },
    { name: 'Health', emoji: '🏥' },
    { name: 'Education', emoji: '📚' },
    { name: 'Personal Care', emoji: '✨' },
];

export default function Onboarding() {
    const navigate = useNavigate();
    const { addSource, addCategory, addPerson, user } = useApp();
    const [currentStep, setCurrentStep] = useState<Step>('welcome');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sources State
    const [sourceName, setSourceName] = useState('');
    const [sourceType, setSourceType] = useState<'BANK' | 'CARD' | 'CASH'>('BANK');
    const [sources, setSources] = useState<{ name: string; type: string }[]>([]);

    // Categories State
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    // People State
    const [personName, setPersonName] = useState('');
    const [personRelation, setPersonRelation] = useState<'Self' | 'Friend' | 'Family'>('Friend');
    const [people, setPeople] = useState<{ name: string; relation: string }[]>([]);

    const steps: Step[] = ['welcome', 'sources', 'categories', 'people', 'complete'];
    const progress = ((steps.indexOf(currentStep) + 1) / steps.length) * 100;

    const nextStep = () => {
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1]);
        } else {
            handleComplete();
        }
    };

    const skip = () => {
        nextStep();
    };

    const handleComplete = () => {
        toast.success('Onboarding complete!');
        navigate('/dashboard');
    };

    const handleAddSource = async () => {
        if (!sourceName.trim()) return;
        setSources([...sources, { name: sourceName, type: sourceType }]);
        setIsSubmitting(true);
        try {
            await addSource(sourceName, sourceType, 0);
            setSourceName('');
            toast.success(`Added ${sourceName}`);
        } catch (err) {
            toast.error('Failed to add source');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleCategory = async (cat: { name: string; emoji: string }) => {
        if (selectedCategories.includes(cat.name)) {
            // In a real app we might want to prevent deletion if already saved to DB during this session
            // For onboarding simplicity, we'll just allow adding.
            return;
        }

        setSelectedCategories([...selectedCategories, cat.name]);
        setIsSubmitting(true);
        try {
            await addCategory(cat.name, cat.emoji);
            toast.success(`Added ${cat.name}`);
        } catch (err) {
            toast.error('Failed to add category');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddPerson = async () => {
        if (!personName.trim()) return;
        setPeople([...people, { name: personName, relation: personRelation }]);
        setIsSubmitting(true);
        try {
            await addPerson(personName, personRelation);
            setPersonName('');
            toast.success(`Added ${personName}`);
        } catch (err) {
            toast.error('Failed to add person');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 bg-gradient-to-b from-primary/5 to-background">
            <div className="w-full max-w-lg space-y-8 animate-fade-in">
                {/* Progress bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <span>Step {steps.indexOf(currentStep) + 1} of {steps.length}</span>
                        <span>{Math.round(progress)}% Complete</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                </div>

                <Card className="border-2 shadow-xl overflow-hidden">
                    {currentStep === 'welcome' && (
                        <div className="animate-slide-up">
                            <CardHeader className="text-center pb-2">
                                <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                    <Sparkles className="w-8 h-8 text-primary" />
                                </div>
                                <CardTitle className="text-3xl font-bold">Welcome to CashTag!</CardTitle>
                                <CardDescription className="text-base mt-2">
                                    Hi {user?.name.split(' ')[0] || 'there'}! Let's get your personal finance tracker set up in just a few steps.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center space-y-4 pt-6">
                                <p className="text-sm text-muted-foreground">
                                    We'll help you set up your accounts, categories, and people so you can start tracking immediately.
                                </p>
                                <div className="bg-secondary/30 rounded-xl p-4 text-sm text-left border border-border">
                                    <p className="font-medium mb-1">💡 Quick Tip</p>
                                    <p className="text-muted-foreground">Don't worry, everything you set up now can be edited or changed later in settings.</p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-3 pb-8">
                                <Button className="w-full h-12 text-lg group" onClick={nextStep}>
                                    Get Started
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                                <Button variant="ghost" className="text-muted-foreground" onClick={handleComplete}>
                                    Skip everything
                                </Button>
                            </CardFooter>
                        </div>
                    )}

                    {currentStep === 'sources' && (
                        <div className="animate-slide-up">
                            <CardHeader>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <Wallet className="w-5 h-5" />
                                    </div>
                                    <CardTitle>Your Sources</CardTitle>
                                </div>
                                <CardDescription>
                                    Where do you keep your money? Add your bank accounts or cash wallets.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-4 p-4 border rounded-xl bg-secondary/10">
                                    <div className="space-y-2">
                                        <Label htmlFor="source-name">Account Name</Label>
                                        <Input
                                            id="source-name"
                                            placeholder="e.g. HDFC Bank, My Wallet"
                                            value={sourceName}
                                            onChange={(e) => setSourceName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="source-type">Account Type</Label>
                                        <Select value={sourceType} onValueChange={(v) => setSourceType(v as any)}>
                                            <SelectTrigger id="source-type">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="BANK">Bank Account</SelectItem>
                                                <SelectItem value="CARD">Credit Card</SelectItem>
                                                <SelectItem value="CASH">Cash/Wallet</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button variant="secondary" className="w-full" onClick={handleAddSource} disabled={isSubmitting || !sourceName.trim()}>
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                        Add Account
                                    </Button>
                                </div>

                                {sources.length > 0 && (
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase text-muted-foreground font-semibold">Added Accounts</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {sources.map((s, i) => (
                                                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-sm font-medium animate-scale-in">
                                                    <Check className="w-3 h-3" />
                                                    {s.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-between border-t mt-4 pt-6 pb-8">
                                <Button variant="ghost" className="text-muted-foreground" onClick={skip}>
                                    <SkipForward className="w-4 h-4 mr-2" />
                                    Skip
                                </Button>
                                <Button onClick={nextStep} disabled={isSubmitting}>
                                    Next: Categories
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </CardFooter>
                        </div>
                    )}

                    {currentStep === 'categories' && (
                        <div className="animate-slide-up">
                            <CardHeader>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                                        <Tag className="w-5 h-5" />
                                    </div>
                                    <CardTitle>Common Categories</CardTitle>
                                </div>
                                <CardDescription>
                                    Select the categories you usually spend on. You can always add more later.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-3">
                                    {COMMON_CATEGORIES.map((cat) => {
                                        const isSelected = selectedCategories.includes(cat.name);
                                        return (
                                            <button
                                                key={cat.name}
                                                onClick={() => toggleCategory(cat)}
                                                disabled={isSubmitting}
                                                className={cn(
                                                    "flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left",
                                                    isSelected
                                                        ? "bg-green-50 border-green-500 text-green-700 ring-2 ring-green-500/10"
                                                        : "bg-background border-border hover:border-primary/50 text-foreground"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">{cat.emoji}</span>
                                                    <span className="font-medium text-sm">{cat.name}</span>
                                                </div>
                                                {isSelected && <Check className="w-4 h-4" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between border-t mt-4 pt-6 pb-8">
                                <Button variant="ghost" className="text-muted-foreground" onClick={skip}>
                                    <SkipForward className="w-4 h-4 mr-2" />
                                    Skip
                                </Button>
                                <Button onClick={nextStep} disabled={isSubmitting}>
                                    Next: People
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </CardFooter>
                        </div>
                    )}

                    {currentStep === 'people' && (
                        <div className="animate-slide-up">
                            <CardHeader>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                                        <UserPlus className="w-5 h-5" />
                                    </div>
                                    <CardTitle>People</CardTitle>
                                </div>
                                <CardDescription>
                                    Who are you spending with? Add family members or friends.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-4 p-4 border rounded-xl bg-secondary/10">
                                    <div className="space-y-2">
                                        <Label htmlFor="person-name">Name</Label>
                                        <Input
                                            id="person-name"
                                            placeholder="e.g. Spouse, Roommate"
                                            value={personName}
                                            onChange={(e) => setPersonName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="person-relation">Relationship</Label>
                                        <Select value={personRelation} onValueChange={(v) => setPersonRelation(v as any)}>
                                            <SelectTrigger id="person-relation">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Family">Family</SelectItem>
                                                <SelectItem value="Friend">Friend</SelectItem>
                                                <SelectItem value="Self">Self (Other)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button variant="secondary" className="w-full" onClick={handleAddPerson} disabled={isSubmitting || !personName.trim()}>
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                        Add Person
                                    </Button>
                                </div>

                                {people.length > 0 && (
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase text-muted-foreground font-semibold">Added People</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {people.map((p, i) => (
                                                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg text-sm font-medium animate-scale-in">
                                                    <Check className="w-3 h-3" />
                                                    {p.name} ({p.relation})
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-between border-t mt-4 pt-6 pb-8">
                                <Button variant="ghost" className="text-muted-foreground" onClick={skip}>
                                    <SkipForward className="w-4 h-4 mr-2" />
                                    Skip
                                </Button>
                                <Button onClick={nextStep} disabled={isSubmitting}>
                                    Finish Setup
                                    <Check className="ml-2 w-4 h-4" />
                                </Button>
                            </CardFooter>
                        </div>
                    )}

                    {currentStep === 'complete' && (
                        <div className="animate-slide-up text-center">
                            <CardHeader className="pb-2">
                                <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                                    <Check className="w-10 h-10 text-green-600" />
                                </div>
                                <CardTitle className="text-3xl font-bold">You're all set!</CardTitle>
                                <CardDescription className="text-base mt-2">
                                    Your CashTag setup is complete. You can now start tracking your expenses and income.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground mb-8">
                                    Everything you've set up is saved in your Google Sheet. It's your data, forever!
                                </p>
                            </CardContent>
                            <CardFooter className="pb-8">
                                <Button className="w-full h-12 text-lg" onClick={handleComplete}>
                                    Go to Dashboard
                                </Button>
                            </CardFooter>
                        </div>
                    )}
                </Card>

                {currentStep !== 'welcome' && currentStep !== 'complete' && (
                    <p className="text-center text-sm text-muted-foreground">
                        You can always come back and change these in the <b>Settings</b>.
                    </p>
                )}
            </div>
        </div>
    );
}
