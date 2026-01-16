import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { TrendingDown, TrendingUp, PieChartIcon, BarChart3 } from 'lucide-react';

export default function Trends() {
  const { expenses, categories } = useApp();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Group expenses by category for this month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthlyExpenses = expenses.filter(
    e => e.entryType === 'EXPENSE' && new Date(e.date) >= startOfMonth
  );

  const monthlyIncome = expenses.filter(
    e => e.entryType === 'INCOME' && new Date(e.date) >= startOfMonth
  );

  const totalExpense = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = monthlyIncome.reduce((sum, e) => sum + e.amount, 0);

  const categoryTotals = monthlyExpenses.reduce((acc, expense) => {
    const existing = acc.find(c => c.categoryId === expense.categoryId);
    if (existing) {
      existing.total += expense.amount;
    } else {
      const category = categories.find(c => c.id === expense.categoryId);
      acc.push({
        categoryId: expense.categoryId,
        name: category?.name || 'Unknown',
        total: expense.amount,
        color: category?.color || '#6b7280',
      });
    }
    return acc;
  }, [] as { categoryId: string; name: string; total: number; color: string }[]);

  categoryTotals.sort((a, b) => b.total - a.total);

  // Generate daily spending data for the past 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const dailySpending = last7Days.map(date => {
    const dayExpenses = expenses.filter(e => {
      const expDate = new Date(e.date);
      return e.entryType === 'EXPENSE' &&
        expDate.toDateString() === date.toDateString();
    });
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      amount: dayExpenses.reduce((sum, e) => sum + e.amount, 0),
    };
  });

  // Income vs Expense comparison
  const comparisonData = [
    { name: 'Income', value: totalIncome, fill: 'hsl(var(--income))' },
    { name: 'Expense', value: totalExpense, fill: 'hsl(var(--expense))' },
  ];

  return (
    <AppLayout title="Trends">
      <div className="space-y-6 pb-4">
        {/* Header */}
        <div className="animate-slide-up">
          <p className="text-muted-foreground">Spending insights</p>
          <h2 className="text-2xl font-bold text-foreground">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: '50ms' }}>
          <Card className="bg-expense-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-4 h-4 text-expense" />
                <span className="text-sm text-muted-foreground">Spent</span>
              </div>
              <p className="text-2xl font-bold text-expense">{formatCurrency(totalExpense)}</p>
            </CardContent>
          </Card>
          <Card className="bg-income-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-income" />
                <span className="text-sm text-muted-foreground">Earned</span>
              </div>
              <p className="text-2xl font-bold text-income">{formatCurrency(totalIncome)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown Pie Chart */}
        <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChartIcon className="w-4 h-4" />
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryTotals.length > 0 ? (
              <div className="flex items-center gap-4">
                <div className="w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryTotals}
                        dataKey="total"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        paddingAngle={2}
                      >
                        {categoryTotals.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {categoryTotals.slice(0, 4).map((cat) => (
                    <div key={cat.categoryId} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-sm text-foreground flex-1 truncate">{cat.name}</span>
                      <span className="text-sm font-medium text-muted-foreground">
                        {formatCurrency(cat.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No expenses this month</p>
            )}
          </CardContent>
        </Card>

        {/* Daily Spending Bar Chart */}
        <Card className="animate-slide-up" style={{ animationDelay: '150ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-4 h-4" />
              Last 7 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailySpending}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis hide />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Income vs Expense Chart */}
        <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Income vs Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    width={60}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {comparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-muted-foreground">
                Net: <span className={cn(
                  "font-semibold",
                  totalIncome - totalExpense >= 0 ? "text-income" : "text-expense"
                )}>
                  {totalIncome - totalExpense >= 0 ? '+' : ''}{formatCurrency(totalIncome - totalExpense)}
                </span>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* All Transactions */}
        <div className="space-y-3 pt-2">
          <h3 className="font-semibold text-foreground">All Transactions</h3>
          {expenses.map((expense, index) => {
            const category = categories.find(c => c.id === expense.categoryId);
            return (
              <Card
                key={expense.id}
                className="animate-slide-up"
                style={{ animationDelay: `${250 + index * 30}ms` }}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium",
                    expense.entryType === 'INCOME' ? 'bg-income-soft text-income' : 'bg-expense-soft text-expense'
                  )}>
                    {expense.entryType === 'INCOME' ? '+' : '-'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {category?.name || 'Unknown'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <p className={cn(
                    "font-semibold",
                    expense.entryType === 'INCOME' ? 'text-income' : 'text-expense'
                  )}>
                    {expense.entryType === 'INCOME' ? '+' : '-'}{formatCurrency(expense.amount)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
