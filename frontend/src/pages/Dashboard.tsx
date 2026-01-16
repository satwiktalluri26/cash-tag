import { ArrowDownLeft, ArrowUpRight, User, ChevronRight } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { user, getMonthlyTotal, getPersonalSpending, expenses, categories, sources } = useApp();

  const monthlyExpense = getMonthlyTotal('EXPENSE');
  const monthlyIncome = getMonthlyTotal('INCOME');
  const personalSpending = getPersonalSpending();

  const recentExpenses = expenses.slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown';
  const getSourceName = (id: string) => sources.find(s => s.id === id)?.name || 'Unknown';

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Greeting */}
        <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
          <p className="text-muted-foreground">Hello,</p>
          <h1 className="text-3xl font-bold text-foreground">
            {user?.name || 'Friend'} 👋
          </h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: '50ms' }}>
          <SummaryCard
            label="This Month"
            value={formatCurrency(monthlyExpense)}
            type="expense"
            icon={ArrowUpRight}
          />
          <SummaryCard
            label="Income"
            value={formatCurrency(monthlyIncome)}
            type="income"
            icon={ArrowDownLeft}
          />
        </div>

        {/* Personal Spending Widget */}
        <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Spent on Me</p>
                <p className="text-xl font-semibold text-foreground">
                  {formatCurrency(personalSpending)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent</h2>
            <Link
              to="/trends"
              className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-2">
            {recentExpenses.map((expense, index) => (
              <TransactionRow
                key={expense.id}
                category={getCategoryName(expense.categoryId)}
                source={getSourceName(expense.sourceId)}
                amount={expense.amount}
                type={expense.entryType}
                date={expense.date}
                style={{ animationDelay: `${200 + index * 50}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function SummaryCard({
  label,
  value,
  type,
  icon: Icon,
}: {
  label: string;
  value: string;
  type: 'income' | 'expense';
  icon: typeof ArrowUpRight;
}) {
  return (
    <Card className={cn(
      "overflow-hidden",
      type === 'income' ? 'bg-income-soft' : 'bg-expense-soft'
    )}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={cn(
            "w-4 h-4",
            type === 'income' ? 'text-income' : 'text-expense'
          )} />
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <p className={cn(
          "text-2xl font-bold",
          type === 'income' ? 'text-income' : 'text-expense'
        )}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function TransactionRow({
  category,
  source,
  amount,
  type,
  date,
  style,
}: {
  category: string;
  source: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: Date;
  style?: React.CSSProperties;
}) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card className="animate-slide-up" style={style}>
      <CardContent className="p-3 flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center text-lg",
          type === 'INCOME' ? 'bg-income-soft' : 'bg-expense-soft'
        )}>
          {type === 'INCOME' ? '💰' : '🛒'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{category}</p>
          <p className="text-sm text-muted-foreground">{source}</p>
        </div>
        <div className="text-right">
          <p className={cn(
            "font-semibold",
            type === 'INCOME' ? 'text-income' : 'text-expense'
          )}>
            {type === 'INCOME' ? '+' : '-'}{formatCurrency(amount)}
          </p>
          <p className="text-xs text-muted-foreground">{formatDate(date)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
