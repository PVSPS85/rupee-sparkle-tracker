import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = {
  expense: ['Food', 'Rent', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Other'],
  income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Refund', 'Other'],
};

export function AddTransactionModal({ isOpen, onClose }: AddTransactionModalProps) {
  const { addTransaction } = useAppStore();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category) {
      toast.error('Please fill in all required fields');
      return;
    }

    addTransaction({
      amount: parseFloat(amount),
      type,
      category,
      date,
      note,
    });

    toast.success('Transaction added successfully!', {
      description: `${type === 'income' ? '+' : '-'}₹${parseFloat(amount).toLocaleString('en-IN')} in ${category}`,
    });

    // Reset form
    setAmount('');
    setCategory('');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <Card variant="neon" className="w-full max-w-md p-6 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              <h2 className="font-display text-xl font-semibold mb-6">Add Transaction</h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Type Toggle */}
                <div className="flex gap-2 p-1 bg-secondary rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setType('expense');
                      setCategory('');
                    }}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md font-medium transition-all",
                      type === 'expense'
                        ? "bg-gradient-to-r from-neon-orange to-neon-pink text-primary-foreground shadow-lg"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Minus className="w-4 h-4" />
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setType('income');
                      setCategory('');
                    }}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md font-medium transition-all",
                      type === 'income'
                        ? "bg-gradient-to-r from-neon-green to-neon-cyan text-primary-foreground shadow-lg"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Plus className="w-4 h-4" />
                    Income
                  </button>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Amount *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      variant="neon"
                      className="pl-8 text-lg font-semibold"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Category *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES[type].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                          category === cat
                            ? type === 'income'
                              ? "bg-neon-green/20 text-neon-green border border-neon-green/50"
                              : "bg-neon-orange/20 text-neon-orange border border-neon-orange/50"
                            : "bg-secondary text-muted-foreground hover:text-foreground border border-transparent"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    variant="neon"
                  />
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Note (optional)
                  </label>
                  <Input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note..."
                    variant="neon"
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  variant={type === 'income' ? 'success' : 'danger'}
                  className="w-full"
                  size="lg"
                >
                  Add {type === 'income' ? 'Income' : 'Expense'}
                </Button>
              </form>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
