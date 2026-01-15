import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Person, Source, Category, Subcategory, Expense, AccountBalance, CacheWithBalance } from '@/types/finance';

// Mock data for demo
const mockPeople: Person[] = [
  { id: '1', name: 'Me', relation: 'Self', createdAt: new Date() },
  { id: '2', name: 'Alex', relation: 'Friend', createdAt: new Date() },
  { id: '3', name: 'Mom', relation: 'Family', createdAt: new Date() },
];

const mockSources: Source[] = [
  { id: '1', name: 'Main Checking', type: 'BANK', createdAt: new Date() },
  { id: '2', name: 'Credit Card', type: 'CARD', createdAt: new Date() },
  { id: '3', name: 'Cash Wallet', type: 'CASH', createdAt: new Date() },
];

const mockCategories: Category[] = [
  { id: '1', name: 'Food & Dining', entryType: 'EXPENSE', color: '#ef4444', createdAt: new Date() },
  { id: '2', name: 'Transportation', entryType: 'EXPENSE', color: '#f97316', createdAt: new Date() },
  { id: '3', name: 'Shopping', entryType: 'EXPENSE', color: '#8b5cf6', createdAt: new Date() },
  { id: '4', name: 'Bills & Utilities', entryType: 'EXPENSE', color: '#06b6d4', createdAt: new Date() },
  { id: '5', name: 'Salary', entryType: 'INCOME', color: '#22c55e', createdAt: new Date() },
  { id: '6', name: 'Freelance', entryType: 'INCOME', color: '#10b981', createdAt: new Date() },
];

const mockSubcategories: Subcategory[] = [
  { id: '1', parentCategoryId: '1', name: 'Groceries', createdAt: new Date() },
  { id: '2', parentCategoryId: '1', name: 'Restaurants', createdAt: new Date() },
  { id: '3', parentCategoryId: '1', name: 'Coffee', createdAt: new Date() },
  { id: '4', parentCategoryId: '2', name: 'Gas', createdAt: new Date() },
  { id: '5', parentCategoryId: '2', name: 'Public Transit', createdAt: new Date() },
];

const mockExpenses: Expense[] = [
  { id: '1', date: new Date(), amount: 45.50, entryType: 'EXPENSE', categoryId: '1', subcategoryId: '1', sourceId: '1', peopleIds: ['1'], createdAt: new Date() },
  { id: '2', date: new Date(), amount: 3200, entryType: 'INCOME', categoryId: '5', sourceId: '1', peopleIds: ['1'], createdAt: new Date() },
  { id: '3', date: new Date(Date.now() - 86400000), amount: 28.00, entryType: 'EXPENSE', categoryId: '1', subcategoryId: '2', sourceId: '2', peopleIds: ['1', '2'], createdAt: new Date() },
];

const mockBalances: AccountBalance[] = [
  { id: '1', sourceId: '1', date: new Date(), balance: 4250.00, calculatedFrom: 'SYSTEM', createdAt: new Date() },
  { id: '2', sourceId: '2', date: new Date(), balance: -320.50, calculatedFrom: 'SYSTEM', createdAt: new Date() },
  { id: '3', sourceId: '3', date: new Date(), balance: 85.00, calculatedFrom: 'SYSTEM', createdAt: new Date() },
];

interface AppContextType {
  isAuthenticated: boolean;
  isConnected: boolean;
  user: { name: string; email: string; avatar?: string } | null;
  accessToken: string | null;
  people: Person[];
  sources: Source[];
  categories: Category[];
  subcategories: Subcategory[];
  expenses: Expense[];
  balances: AccountBalance[];
  cachesWithBalances: CacheWithBalance[];
  login: (userData: { name: string; email: string; avatar?: string }, token: string) => void;
  logout: () => void;
  connectSheet: (url: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  addPerson: (name: string, relation: 'Self' | 'Friend' | 'Family') => Person;
  addCategory: (name: string, entryType: 'INCOME' | 'EXPENSE', color: string) => Category;
  getMonthlyTotal: (type: 'INCOME' | 'EXPENSE') => number;
  getPersonalSpending: () => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [people, setPeople] = useState<Person[]>(mockPeople);
  const [sources] = useState<Source[]>(mockSources);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [subcategories] = useState<Subcategory[]>(mockSubcategories);
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [balances] = useState<AccountBalance[]>(mockBalances);
  const cachesWithBalances: CacheWithBalance[] = sources.map(source => {
    const latestBalance = balances
      .filter(b => b.sourceId === source.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    return {
      ...source,
      currentBalance: latestBalance?.balance || 0,
    };
  });

  const login = (userData: { name: string; email: string; avatar?: string }, token: string) => {
    setIsAuthenticated(true);
    setUser(userData);
    setAccessToken(token);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsConnected(false);
    setUser(null);
    setAccessToken(null);
  };

  const connectSheet = (_url: string) => {
    setIsConnected(true);
  };

  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const addPerson = (name: string, relation: 'Self' | 'Friend' | 'Family'): Person => {
    const newPerson: Person = {
      id: crypto.randomUUID(),
      name,
      relation,
      createdAt: new Date(),
    };
    setPeople(prev => [...prev, newPerson]);
    return newPerson;
  };

  const addCategory = (name: string, entryType: 'INCOME' | 'EXPENSE', color: string): Category => {
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name,
      entryType,
      color,
      createdAt: new Date(),
    };
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  };

  const getMonthlyTotal = (type: 'INCOME' | 'EXPENSE') => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return expenses
      .filter(e => e.entryType === type && new Date(e.date) >= startOfMonth)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const getPersonalSpending = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const selfId = people.find(p => p.relation === 'Self')?.id;
    return expenses
      .filter(e =>
        e.entryType === 'EXPENSE' &&
        new Date(e.date) >= startOfMonth &&
        e.peopleIds.includes(selfId || '')
      )
      .reduce((sum, e) => sum + e.amount, 0);
  };

  return (
    <AppContext.Provider value={{
      isAuthenticated,
      isConnected,
      user,
      accessToken,
      people,
      sources,
      categories,
      subcategories,
      expenses,
      balances,
      cachesWithBalances,
      login,
      logout,
      connectSheet,
      addExpense,
      addPerson,
      addCategory,
      getMonthlyTotal,
      getPersonalSpending,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
