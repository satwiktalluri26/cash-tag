import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import type { Person, Source, Category, Subcategory, Expense, AccountBalance, SourceWithBalance } from '@/types/finance';
import { CashTagDB } from '@/lib/cashTagDB';

interface AppContextType {
  isAuthenticated: boolean;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  user: { name: string; email: string; avatar?: string } | null;
  accessToken: string | null;
  people: Person[];
  sources: Source[];
  categories: Category[];
  subcategories: Subcategory[];
  expenses: Expense[];
  balances: AccountBalance[];
  sourcesWithBalances: SourceWithBalance[];
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  login: (userData: { name: string; email: string; avatar?: string }, token: string) => void;
  logout: () => void;
  connectSheet: (id: string, url: string) => void;
  refreshData: () => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  addPerson: (name: string, relation: 'Self' | 'Friend' | 'Family') => Promise<Person>;
  addCategory: (name: string, emoji?: string) => Promise<Category>;
  addSubcategory: (name: string, parentCategoryId: string) => Promise<Subcategory>;
  addSource: (name: string, type: 'BANK' | 'CARD' | 'CASH', startingBalance: number) => Promise<Source>;
  updatePerson: (person: Person) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  updateSubcategory: (subcategory: Subcategory) => Promise<void>;
  getMonthlyTotal: (type: 'INCOME' | 'EXPENSE') => number;
  getPersonalSpending: () => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(null);

  const [people, setPeople] = useState<Person[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<AccountBalance[]>([]);

  const db = useMemo(() => accessToken ? new CashTagDB(accessToken) : null, [accessToken]);

  const sourcesWithBalances: SourceWithBalance[] = sources.map(source => {
    const sourceExpenses = expenses.filter(e => e.sourceId === source.id);
    const transactionsSum = sourceExpenses.reduce((sum, e) => {
      return e.entryType === 'INCOME' ? sum + e.amount : sum - e.amount;
    }, 0);

    return {
      ...source,
      currentBalance: (source.startingBalance || 0) + transactionsSum,
    };
  });

  const refreshData = async () => {
    if (!db || !spreadsheetId) return;

    setIsLoading(true);
    setError(null);
    try {
      const [p, s, c, sub, e, b] = await Promise.all([
        db.getPeople(spreadsheetId),
        db.getAccounts(spreadsheetId),
        db.getCategories(spreadsheetId),
        db.getSubcategories(spreadsheetId),
        db.getTransactions(spreadsheetId),
        // balances are not yet implemented in getTableData but we can add them if needed
        // For now, let's just use empty or implement it
        Promise.resolve([]) // balances
      ]);

      setPeople(p);
      setSources(s as Source[]);
      setCategories(c);
      setSubcategories(sub);
      setExpenses(e);
      // setBalances(b);
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && spreadsheetId && db) {
      refreshData();
    }
  }, [isConnected, spreadsheetId, db]);

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
    setSpreadsheetId(null);
    setSpreadsheetUrl(null);
    setPeople([]);
    setSources([]);
    setCategories([]);
    setSubcategories([]);
    setExpenses([]);
    setBalances([]);
  };

  const connectSheet = (id: string, url: string) => {
    setSpreadsheetId(id);
    setSpreadsheetUrl(url);
    setIsConnected(true);
  };

  const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    if (!db || !spreadsheetId) return;

    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    // Update local state for immediate feedback
    setExpenses(prev => [newExpense, ...prev]);

    try {
      await db.addTransaction(spreadsheetId, newExpense);
    } catch (err) {
      console.error('Failed to save transaction:', err);
      // Rollback? Or just show error
      setError('Failed to save transaction to Google Sheets');
    }
  };

  const addPerson = async (name: string, relation: 'Self' | 'Friend' | 'Family'): Promise<Person> => {
    const newPerson: Person = {
      id: crypto.randomUUID(),
      name,
      relation,
      createdAt: new Date(),
    };

    setPeople(prev => [...prev, newPerson]);

    if (db && spreadsheetId) {
      try {
        await db.addPerson(spreadsheetId, newPerson);
      } catch (err) {
        console.error('Failed to save person:', err);
        setError('Failed to save person to Google Sheets');
      }
    }
    return newPerson;
  };

  const addCategory = async (name: string, emoji?: string): Promise<Category> => {
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name,
      emoji,
      createdAt: new Date(),
    };

    setCategories(prev => [...prev, newCategory]);

    if (db && spreadsheetId) {
      try {
        await db.addCategory(spreadsheetId, newCategory);
      } catch (err) {
        console.error('Failed to save category:', err);
        setError('Failed to save category to Google Sheets');
      }
    }
    return newCategory;
  };

  const addSubcategory = async (name: string, parentCategoryId: string): Promise<Subcategory> => {
    const newSub: Subcategory = {
      id: crypto.randomUUID(),
      parentCategoryId,
      name,
      createdAt: new Date(),
    };

    setSubcategories(prev => [...prev, newSub]);

    if (db && spreadsheetId) {
      try {
        await db.addSubcategory(spreadsheetId, newSub);
      } catch (err) {
        console.error('Failed to save subcategory:', err);
        setError('Failed to save subcategory to Google Sheets');
      }
    }
    return newSub;
  };

  const addSource = async (name: string, type: 'BANK' | 'CARD' | 'CASH', startingBalance: number): Promise<Source> => {
    const newSource: Source = {
      id: crypto.randomUUID(),
      name,
      type,
      startingBalance,
      createdAt: new Date(),
    };

    setSources(prev => [...prev, newSource]);

    if (db && spreadsheetId) {
      try {
        await db.addAccount(spreadsheetId, newSource);
      } catch (err) {
        console.error('Failed to save source:', err);
        setError('Failed to save source to Google Sheets');
      }
    }
    return newSource;
  };

  const updatePerson = async (person: Person) => {
    setPeople(prev => prev.map(p => p.id === person.id ? person : p));
    if (db && spreadsheetId) {
      await db.updatePerson(spreadsheetId, person);
    }
  };

  const updateCategory = async (category: Category) => {
    setCategories(prev => prev.map(c => c.id === category.id ? category : c));
    if (db && spreadsheetId) {
      await db.updateCategory(spreadsheetId, category);
    }
  };

  const updateSubcategory = async (subcategory: Subcategory) => {
    setSubcategories(prev => prev.map(s => s.id === subcategory.id ? subcategory : s));
    if (db && spreadsheetId) {
      await db.updateSubcategory(spreadsheetId, subcategory);
    }
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
      isLoading,
      error,
      user,
      accessToken,
      spreadsheetId,
      spreadsheetUrl,
      people,
      sources,
      categories,
      subcategories,
      expenses,
      balances,
      sourcesWithBalances,
      login,
      logout,
      connectSheet,
      refreshData,
      addExpense,
      addPerson,
      addCategory,
      addSubcategory,
      addSource,
      updatePerson,
      updateCategory,
      updateSubcategory,
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
