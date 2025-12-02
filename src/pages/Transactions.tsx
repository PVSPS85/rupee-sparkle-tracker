import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight,
  Trash2,
  Download
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { PageTransition } from '@/components/layout/PageTransition';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import CanvasParticles from '@/components/CanvasParticles';
import { useAppStore, Transaction } from '@/lib/store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Transactions() {
  const { settings, transactions, deleteTransaction } = useAppStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category));
    return ['all', ...Array.from(cats)];
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = 
        t.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || t.type === filterType;
      const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, searchQuery, filterType, filterCategory]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    toast.success('Transaction deleted');
  };

  const handleExport = () => {
    const csv = [
      ['Date', 'Type', 'Category', 'Amount', 'Note'],
      ...filteredTransactions.map(t => [
        t.date,
        t.type,
        t.category,
        t.amount.toString(),
        t.note,
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    toast.success('Transactions exported');
  };

  return (
    <div className="min-h-screen relative">
      <CanvasParticles enabled={settings.particlesEnabled} particleCount={20} />
      <Navbar />
      
      <main className="pt-20 pb-8 px-4">
        <PageTransition>
          <div className="container mx-auto max-w-5xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="font-display text-3xl font-bold">Transactions</h1>
                <p className="text-muted-foreground mt-1">
                  {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleExport}
                  disabled={filteredTransactions.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button
                  variant="neon"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            {/* Filters */}
            <Card variant="glass" className="p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    variant="neon"
                    className="pl-10"
                  />
                </div>

                {/* Type Filter */}
                <div className="flex gap-2">
                  {(['all', 'income', 'expense'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize",
                        filterType === type
                          ? type === 'income'
                            ? "bg-neon-green/20 text-neon-green border border-neon-green/50"
                            : type === 'expense'
                            ? "bg-neon-orange/20 text-neon-orange border border-neon-orange/50"
                            : "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Category Filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-secondary border border-border text-sm focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20 transition-all"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-background">
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>
            </Card>

            {/* Transactions List */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredTransactions.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
                    <p className="text-muted-foreground">No transactions found</p>
                    <Button
                      variant="neon"
                      className="mt-4"
                      onClick={() => setIsAddModalOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add your first transaction
                    </Button>
                  </motion.div>
                ) : (
                  filteredTransactions.map((transaction, index) => (
                    <TransactionItem
                      key={transaction.id}
                      transaction={transaction}
                      index={index}
                      onDelete={handleDelete}
                      formatCurrency={formatCurrency}
                      formatDate={formatDate}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </PageTransition>
      </main>

      <AddTransactionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}

interface TransactionItemProps {
  transaction: Transaction;
  index: number;
  onDelete: (id: string) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
}

function TransactionItem({ 
  transaction, 
  index, 
  onDelete,
  formatCurrency,
  formatDate,
}: TransactionItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card variant="glass" className="p-4 group hover:border-border/50 transition-all">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-xl",
              transaction.type === 'income' 
                ? "bg-neon-green/10" 
                : "bg-neon-orange/10"
            )}>
              {transaction.type === 'income' ? (
                <ArrowUpRight className="w-5 h-5 text-neon-green" />
              ) : (
                <ArrowDownRight className="w-5 h-5 text-neon-orange" />
              )}
            </div>
            <div>
              <p className="font-medium">{transaction.category}</p>
              <p className="text-sm text-muted-foreground">
                {transaction.note || 'No note'} • {formatDate(transaction.date)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <p className={cn(
              "font-display font-semibold text-lg",
              transaction.type === 'income' 
                ? "text-neon-green" 
                : "text-neon-orange"
            )}>
              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </p>
            <button
              onClick={() => onDelete(transaction.id)}
              className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
