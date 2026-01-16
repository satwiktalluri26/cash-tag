import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Wallet, CreditCard, Banknote, TrendingUp, TrendingDown, Plus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Sources() {
  const { sourcesWithBalances, addSource } = useApp();
  const [showAddSource, setShowAddSource] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'BANK' | 'CARD' | 'CASH'>('BANK');
  const [newStartingBalance, setNewStartingBalance] = useState('');

  const totalBalance = sourcesWithBalances.reduce((sum, c) => sum + c.currentBalance, 0);

  const handleAddSource = async () => {
    if (!newName.trim()) {
      toast.error('Please enter a name');
      return;
    }
    const exists = sourcesWithBalances.some(c => c.name.toLowerCase() === newName.trim().toLowerCase());
    if (exists) {
      toast.error('A source with this name already exists');
      return;
    }
    setIsSubmitting(true);
    try {
      await addSource(newName.trim(), newType, parseFloat(newStartingBalance) || 0);
      toast.success('Source added!');
      setShowAddSource(false);
      setNewName('');
      setNewType('BANK');
      setNewStartingBalance('');
    } catch (err) {
      toast.error('Failed to add source');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'BANK': return Wallet;
      case 'CARD': return CreditCard;
      case 'CASH': return Banknote;
      default: return Wallet;
    }
  };

  return (
    <AppLayout title="Sources">
      <div className="space-y-6">
        {/* Total Balance */}
        <Card className="bg-primary text-primary-foreground animate-slide-up">
          <CardContent className="p-6">
            <p className="text-sm opacity-80 mb-1">Total Balance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">
                {formatCurrency(totalBalance)}
              </span>
              {totalBalance >= 0 ? (
                <TrendingUp className="w-5 h-5 opacity-80" />
              ) : (
                <TrendingDown className="w-5 h-5 opacity-80" />
              )}
            </div>
            <p className="text-sm opacity-60 mt-2">
              Across {sourcesWithBalances.length} accounts
            </p>
          </CardContent>
        </Card>

        {/* Individual Sources */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Your Accounts</h2>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-primary"
              onClick={() => setShowAddSource(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Source
            </Button>
          </div>

          {sourcesWithBalances.map((source, index) => {
            const Icon = getIcon(source.type);
            const isPositive = source.currentBalance >= 0;

            return (
              <Card
                key={source.id}
                className="animate-slide-up cursor-pointer hover:shadow-soft transition-shadow"
                style={{ animationDelay: `${100 + index * 50}ms` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      source.type === 'BANK' ? 'bg-blue-100 text-blue-600' :
                        source.type === 'CARD' ? 'bg-purple-100 text-purple-600' :
                          'bg-green-100 text-green-600'
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{source.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {source.type.toLowerCase()}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className={cn(
                        "text-xl font-bold",
                        isPositive ? "text-income" : "text-expense"
                      )}>
                        {isPositive ? '' : '-'}{formatCurrency(source.currentBalance)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="pt-4">
          <Card className="bg-secondary/50 border-dashed animate-slide-up" style={{ animationDelay: '300ms' }}>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Balance history and trends coming soon
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Source Dialog */}
      <Dialog open={showAddSource} onOpenChange={setShowAddSource}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Source</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="source-name">Account Name</Label>
              <Input
                id="source-name"
                placeholder="e.g. HDFC Bank, Amex Card"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source-type">Type</Label>
              <Select value={newType} onValueChange={(v) => setNewType(v as any)}>
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
            <div className="space-y-2">
              <Label htmlFor="source-balance">Starting Balance</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  id="source-balance"
                  type="number"
                  placeholder="0.00"
                  value={newStartingBalance}
                  onChange={(e) => setNewStartingBalance(e.target.value)}
                  className="pl-7"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSource(false)}>Cancel</Button>
            <Button onClick={handleAddSource} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Source
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
