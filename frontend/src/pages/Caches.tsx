import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Wallet, CreditCard, Banknote, TrendingUp, TrendingDown } from 'lucide-react';

export default function Caches() {
  const { cachesWithBalances } = useApp();

  const totalBalance = cachesWithBalances.reduce((sum, c) => sum + c.currentBalance, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
              Across {cachesWithBalances.length} accounts
            </p>
          </CardContent>
        </Card>

        {/* Individual Caches */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Your Accounts</h2>
          
          {cachesWithBalances.map((cache, index) => {
            const Icon = getIcon(cache.type);
            const isPositive = cache.currentBalance >= 0;

            return (
              <Card 
                key={cache.id}
                className="animate-slide-up cursor-pointer hover:shadow-soft transition-shadow"
                style={{ animationDelay: `${100 + index * 50}ms` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      cache.type === 'BANK' ? 'bg-blue-100 text-blue-600' :
                      cache.type === 'CARD' ? 'bg-purple-100 text-purple-600' :
                      'bg-green-100 text-green-600'
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{cache.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {cache.type.toLowerCase()}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className={cn(
                        "text-xl font-bold",
                        isPositive ? "text-income" : "text-expense"
                      )}>
                        {isPositive ? '' : '-'}{formatCurrency(cache.currentBalance)}
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
    </AppLayout>
  );
}
