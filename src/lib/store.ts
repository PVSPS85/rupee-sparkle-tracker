import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  note: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  category: string;
  monthlyLimit: number;
  spent: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AppSettings {
  particlesEnabled: boolean;
  reduceMotion: boolean;
}

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  // Budgets
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id' | 'spent'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  
  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

// Demo data
const demoTransactions: Transaction[] = [
  { id: '1', amount: 50000, type: 'income', category: 'Salary', date: '2024-01-01', note: 'Monthly salary', createdAt: '2024-01-01T09:00:00Z' },
  { id: '2', amount: 2500, type: 'expense', category: 'Food', date: '2024-01-02', note: 'Groceries', createdAt: '2024-01-02T10:00:00Z' },
  { id: '3', amount: 15000, type: 'expense', category: 'Rent', date: '2024-01-03', note: 'Monthly rent', createdAt: '2024-01-03T08:00:00Z' },
  { id: '4', amount: 800, type: 'expense', category: 'Transport', date: '2024-01-04', note: 'Metro card recharge', createdAt: '2024-01-04T11:00:00Z' },
  { id: '5', amount: 3500, type: 'expense', category: 'Utilities', date: '2024-01-05', note: 'Electricity bill', createdAt: '2024-01-05T14:00:00Z' },
  { id: '6', amount: 2000, type: 'expense', category: 'Entertainment', date: '2024-01-06', note: 'Movie and dinner', createdAt: '2024-01-06T19:00:00Z' },
  { id: '7', amount: 5000, type: 'income', category: 'Freelance', date: '2024-01-07', note: 'Side project payment', createdAt: '2024-01-07T16:00:00Z' },
  { id: '8', amount: 1200, type: 'expense', category: 'Food', date: '2024-01-08', note: 'Restaurant', createdAt: '2024-01-08T20:00:00Z' },
  { id: '9', amount: 4000, type: 'expense', category: 'Shopping', date: '2024-01-09', note: 'New clothes', createdAt: '2024-01-09T15:00:00Z' },
  { id: '10', amount: 10000, type: 'expense', category: 'Savings', date: '2024-01-10', note: 'Monthly savings', createdAt: '2024-01-10T09:00:00Z' },
];

const demoBudgets: Budget[] = [
  { id: '1', category: 'Food', monthlyLimit: 8000, spent: 3700 },
  { id: '2', category: 'Transport', monthlyLimit: 3000, spent: 800 },
  { id: '3', category: 'Entertainment', monthlyLimit: 5000, spent: 2000 },
  { id: '4', category: 'Shopping', monthlyLimit: 6000, spent: 4000 },
];

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        // Demo login - in production, this would call the API
        if (email === 'demo@demo.com' && password === 'Demo1234') {
          set({
            user: { id: '1', name: 'Demo User', email: 'demo@demo.com' },
            isAuthenticated: true,
            transactions: demoTransactions,
            budgets: demoBudgets,
          });
          return true;
        }
        // Simple validation for any email/password combo
        if (email && password.length >= 6) {
          set({
            user: { id: generateId(), name: email.split('@')[0], email },
            isAuthenticated: true,
          });
          return true;
        }
        return false;
      },
      
      signup: async (name: string, email: string, password: string) => {
        if (name && email && password.length >= 6) {
          set({
            user: { id: generateId(), name, email },
            isAuthenticated: true,
          });
          return true;
        }
        return false;
      },
      
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          transactions: [],
          budgets: [],
        });
      },
      
      // Transactions
      transactions: [],
      
      addTransaction: (transaction) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));
        
        // Update budget spent
        if (transaction.type === 'expense') {
          const { budgets } = get();
          const budget = budgets.find(b => b.category === transaction.category);
          if (budget) {
            set((state) => ({
              budgets: state.budgets.map(b =>
                b.id === budget.id
                  ? { ...b, spent: b.spent + transaction.amount }
                  : b
              ),
            }));
          }
        }
      },
      
      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },
      
      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },
      
      // Budgets
      budgets: [],
      
      addBudget: (budget) => {
        const newBudget: Budget = {
          ...budget,
          id: generateId(),
          spent: 0,
        };
        set((state) => ({
          budgets: [...state.budgets, newBudget],
        }));
      },
      
      updateBudget: (id, updates) => {
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
        }));
      },
      
      deleteBudget: (id) => {
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
        }));
      },
      
      // Settings
      settings: {
        particlesEnabled: true,
        reduceMotion: false,
      },
      
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },
    }),
    {
      name: 'budget-tracker-storage',
    }
  )
);
