export type EntryType = 'INCOME' | 'EXPENSE';

export interface Person {
  id: string;
  name: string;
  relation: 'Self' | 'Friend' | 'Family';
  notes?: string;
  createdAt: Date;
}

export interface Source {
  id: string;
  name: string;
  type: 'BANK' | 'CARD' | 'CASH';
  startingBalance: number;
  notes?: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  emoji?: string;
  createdAt: Date;
}

export interface Subcategory {
  id: string;
  parentCategoryId: string;
  name: string;
  createdAt: Date;
}

export interface Expense {
  id: string;
  date: Date;
  amount: number;
  entryType: EntryType;
  categoryId: string;
  subcategoryId?: string;
  sourceId: string;
  peopleIds: string[];
  notes?: string;
  createdAt: Date;
}

export interface AccountBalance {
  id: string;
  sourceId: string;
  date: Date;
  balance: number;
  calculatedFrom: 'SYSTEM' | 'MANUAL';
  createdAt: Date;
}

export interface SourceWithBalance extends Source {
  currentBalance: number;
}
