import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function BudgetProgress() {
  const { budgets } = useAppStore();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-destructive';
    if (percentage >= 80) return 'bg-neon-orange';
    return 'bg-neon-green';
  };

  const getProgressGlow = (percentage: number) => {
    if (percentage >= 100) return 'shadow-destructive/50';
    if (percentage >= 80) return 'shadow-neon-orange/50';
    return 'shadow-neon-green/50';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
    >
      <Card variant="glass">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Budget Progress</CardTitle>
          <Link to="/budgets">
            <Button variant="ghost" size="sm" className="text-neon-cyan">
              Manage
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {budgets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No budgets set</p>
              <p className="text-sm mt-1">Create budgets to track your spending</p>
            </div>
          ) : (
            <div className="space-y-4">
              {budgets.map((budget, index) => {
                const percentage = Math.min((budget.spent / budget.monthlyLimit) * 100, 100);
                const isOverBudget = budget.spent >= budget.monthlyLimit;
                const isWarning = percentage >= 80 && percentage < 100;

                return (
                  <motion.div
                    key={budget.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{budget.category}</span>
                        {(isOverBudget || isWarning) && (
                          <AlertTriangle className={cn(
                            "w-4 h-4",
                            isOverBudget ? "text-destructive" : "text-neon-orange"
                          )} />
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.monthlyLimit)}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 + index * 0.1 }}
                        className={cn(
                          "h-full rounded-full shadow-lg",
                          getProgressColor(percentage),
                          getProgressGlow(percentage)
                        )}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{percentage.toFixed(0)}% used</span>
                      <span>
                        {formatCurrency(Math.max(0, budget.monthlyLimit - budget.spent))} remaining
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
