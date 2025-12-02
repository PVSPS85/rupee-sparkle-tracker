import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, AlertTriangle, Edit2, Check, X } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { PageTransition } from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import CanvasParticles from '@/components/CanvasParticles';
import { useAppStore, Budget } from '@/lib/store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CATEGORY_OPTIONS = [
  'Food', 'Rent', 'Transport', 'Utilities', 'Entertainment', 
  'Shopping', 'Healthcare', 'Education', 'Travel', 'Other'
];

export default function Budgets() {
  const { settings, budgets, addBudget, updateBudget, deleteBudget } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newLimit, setNewLimit] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddBudget = () => {
    if (!newCategory || !newLimit) {
      toast.error('Please fill in all fields');
      return;
    }

    const existingBudget = budgets.find(b => b.category === newCategory);
    if (existingBudget) {
      toast.error('Budget for this category already exists');
      return;
    }

    addBudget({
      category: newCategory,
      monthlyLimit: parseFloat(newLimit),
    });

    toast.success('Budget created!');
    setNewCategory('');
    setNewLimit('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    deleteBudget(id);
    toast.success('Budget deleted');
  };

  return (
    <div className="min-h-screen relative">
      <CanvasParticles enabled={settings.particlesEnabled} particleCount={20} />
      <Navbar />
      
      <main className="pt-20 pb-8 px-4">
        <PageTransition>
          <div className="container mx-auto max-w-4xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="font-display text-3xl font-bold">Budgets</h1>
                <p className="text-muted-foreground mt-1">
                  Set spending limits for each category
                </p>
              </div>
              
              <Button
                variant="neon"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Budget
              </Button>
            </div>

            {/* Add Budget Form */}
            <AnimatePresence>
              {isAdding && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6"
                >
                  <Card variant="neon" className="p-6">
                    <h3 className="font-display font-semibold mb-4">Create New Budget</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label className="block text-sm text-muted-foreground mb-2">Category</label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-sm focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20 transition-all"
                        >
                          <option value="">Select category</option>
                          {CATEGORY_OPTIONS.filter(cat => 
                            !budgets.some(b => b.category === cat)
                          ).map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm text-muted-foreground mb-2">Monthly Limit</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                          <Input
                            type="number"
                            value={newLimit}
                            onChange={(e) => setNewLimit(e.target.value)}
                            placeholder="5000"
                            variant="neon"
                            className="pl-8"
                            min="0"
                          />
                        </div>
                      </div>
                      <div className="flex items-end gap-2">
                        <Button variant="success" onClick={handleAddBudget}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" onClick={() => setIsAdding(false)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Budgets List */}
            <div className="grid gap-4">
              <AnimatePresence mode="popLayout">
                {budgets.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
                    <p className="text-muted-foreground mb-4">No budgets created yet</p>
                    <Button variant="neon" onClick={() => setIsAdding(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create your first budget
                    </Button>
                  </motion.div>
                ) : (
                  budgets.map((budget, index) => (
                    <BudgetItem
                      key={budget.id}
                      budget={budget}
                      index={index}
                      onDelete={handleDelete}
                      onUpdate={updateBudget}
                      formatCurrency={formatCurrency}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </PageTransition>
      </main>
    </div>
  );
}

interface BudgetItemProps {
  budget: Budget;
  index: number;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Budget>) => void;
  formatCurrency: (amount: number) => string;
}

function BudgetItem({ budget, index, onDelete, onUpdate, formatCurrency }: BudgetItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLimit, setEditLimit] = useState(budget.monthlyLimit.toString());

  const percentage = Math.min((budget.spent / budget.monthlyLimit) * 100, 100);
  const isOverBudget = budget.spent >= budget.monthlyLimit;
  const isWarning = percentage >= 80 && percentage < 100;

  const getProgressColor = () => {
    if (isOverBudget) return 'bg-destructive';
    if (isWarning) return 'bg-neon-orange';
    return 'bg-neon-green';
  };

  const handleSave = () => {
    onUpdate(budget.id, { monthlyLimit: parseFloat(editLimit) });
    setIsEditing(false);
    toast.success('Budget updated');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card variant="glass" className="p-6 group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-3 h-3 rounded-full",
              getProgressColor()
            )} />
            <div>
              <h3 className="font-display font-semibold text-lg">{budget.category}</h3>
              <div className="flex items-center gap-2 mt-1">
                {(isOverBudget || isWarning) && (
                  <AlertTriangle className={cn(
                    "w-4 h-4",
                    isOverBudget ? "text-destructive" : "text-neon-orange"
                  )} />
                )}
                <span className="text-sm text-muted-foreground">
                  {isOverBudget ? 'Over budget!' : isWarning ? 'Almost there' : 'On track'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">₹</span>
                  <Input
                    type="number"
                    value={editLimit}
                    onChange={(e) => setEditLimit(e.target.value)}
                    className="w-24 h-8"
                    variant="neon"
                  />
                </div>
                <Button size="sm" variant="success" onClick={handleSave}>
                  <Check className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                  <X className="w-3 h-3" />
                </Button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(budget.id)}
                  className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full shadow-lg",
                getProgressColor()
              )}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {formatCurrency(budget.spent)} spent
          </span>
          <span className="font-medium">
            {formatCurrency(budget.monthlyLimit)} limit
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className={cn(
            percentage >= 100 ? "text-destructive" : "text-muted-foreground"
          )}>
            {percentage.toFixed(0)}% used
          </span>
          <span className={cn(
            budget.monthlyLimit - budget.spent > 0 ? "text-neon-green" : "text-destructive"
          )}>
            {formatCurrency(Math.max(0, budget.monthlyLimit - budget.spent))} remaining
          </span>
        </div>
      </Card>
    </motion.div>
  );
}
