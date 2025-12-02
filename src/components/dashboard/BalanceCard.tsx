import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';
import { useMemo } from 'react';

export function BalanceCard() {
  const { transactions } = useAppStore();

  const { totalIncome, totalExpense, balance } = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
    };
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Balance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card variant="neon" className="p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-neon-cyan/20 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Wallet className="w-4 h-4" />
              <span className="text-sm font-medium">Total Balance</span>
            </div>
            <motion.p
              className="text-3xl font-display font-bold text-glow-cyan"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {formatCurrency(balance)}
            </motion.p>
            <p className="text-xs text-muted-foreground mt-2">
              Updated just now
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Total Income */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card variant="glass" className="p-6 relative overflow-hidden group hover:border-neon-green/30 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-neon-green/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-neon-green/20 transition-colors" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <div className="p-1.5 rounded-md bg-neon-green/20">
                <TrendingUp className="w-3.5 h-3.5 text-neon-green" />
              </div>
              <span className="text-sm font-medium">Total Income</span>
            </div>
            <motion.p
              className="text-2xl font-display font-bold text-neon-green"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {formatCurrency(totalIncome)}
            </motion.p>
          </div>
        </Card>
      </motion.div>

      {/* Total Expenses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card variant="glass" className="p-6 relative overflow-hidden group hover:border-neon-orange/30 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-neon-orange/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-neon-orange/20 transition-colors" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <div className="p-1.5 rounded-md bg-neon-orange/20">
                <TrendingDown className="w-3.5 h-3.5 text-neon-orange" />
              </div>
              <span className="text-sm font-medium">Total Expenses</span>
            </div>
            <motion.p
              className="text-2xl font-display font-bold text-neon-orange"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {formatCurrency(totalExpense)}
            </motion.p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
