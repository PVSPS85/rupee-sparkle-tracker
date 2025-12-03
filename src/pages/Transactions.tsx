import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight,
  Trash2,
  Download,
  FileText
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    toast.success('Transactions exported as CSV');
  };

  const handleExportPDF = () => {
    const { user } = useAppStore.getState();
    const doc = new jsPDF();
    
    // Sort transactions by date
    const sortedTransactions = [...filteredTransactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate totals
    const totalIncome = sortedTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = sortedTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpense;

    // Colors
    const primaryColor: [number, number, number] = [6, 182, 212]; // Cyan
    const darkColor: [number, number, number] = [30, 30, 30];
    
    // Header background
    doc.setFillColor(...darkColor);
    doc.rect(0, 0, 210, 45, 'F');
    
    // Logo/Title
    doc.setTextColor(...primaryColor);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Simple Budget Tracker', 15, 20);
    
    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    doc.text('Transaction Statement', 15, 30);
    
    // Statement date
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 15, 38);

    // Account holder info box
    doc.setFillColor(40, 40, 40);
    doc.roundedRect(15, 52, 85, 35, 3, 3, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Account Holder', 20, 62);
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(user?.name || 'User', 20, 72);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(user?.email || 'demo@demo.com', 20, 80);

    // Summary box
    doc.setFillColor(40, 40, 40);
    doc.roundedRect(110, 52, 85, 35, 3, 3, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Statement Period', 115, 62);
    
    if (sortedTransactions.length > 0) {
      const firstDate = new Date(sortedTransactions[0].date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      const lastDate = new Date(sortedTransactions[sortedTransactions.length - 1].date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(`${firstDate} - ${lastDate}`, 115, 72);
    }
    
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Total Transactions: ${sortedTransactions.length}`, 115, 80);

    // Financial Summary
    doc.setFillColor(30, 30, 30);
    doc.roundedRect(15, 95, 180, 30, 3, 3, 'F');
    
    // Income
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Total Income', 25, 106);
    doc.setFontSize(14);
    doc.setTextColor(22, 163, 74); // Green
    doc.text(`+${formatCurrency(totalIncome)}`, 25, 117);
    
    // Expense
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Total Expense', 85, 106);
    doc.setFontSize(14);
    doc.setTextColor(249, 115, 22); // Orange
    doc.text(`-${formatCurrency(totalExpense)}`, 85, 117);
    
    // Net Balance
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Net Balance', 145, 106);
    doc.setFontSize(14);
    doc.setTextColor(...(netBalance >= 0 ? [22, 163, 74] : [239, 68, 68]) as [number, number, number]);
    doc.text(`${netBalance >= 0 ? '+' : ''}${formatCurrency(netBalance)}`, 145, 117);

    // Transaction Table
    const tableData = sortedTransactions.map((t, index) => {
      const date = new Date(t.date);
      return [
        (index + 1).toString(),
        date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        t.category,
        t.note || '-',
        t.type === 'income' ? `+${formatCurrency(t.amount)}` : `-${formatCurrency(t.amount)}`,
      ];
    });

    autoTable(doc, {
      startY: 135,
      head: [['#', 'Date', 'Time', 'Category', 'Description', 'Amount']],
      body: tableData,
      theme: 'plain',
      styles: {
        fontSize: 9,
        cellPadding: 4,
        textColor: [200, 200, 200],
        fillColor: [30, 30, 30],
      },
      headStyles: {
        fillColor: [6, 182, 212],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [40, 40, 40],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 35 },
        4: { cellWidth: 50 },
        5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
      },
      didParseCell: (data) => {
        if (data.column.index === 5 && data.section === 'body') {
          const text = data.cell.text[0];
          if (text.startsWith('+')) {
            data.cell.styles.textColor = [22, 163, 74];
          } else if (text.startsWith('-')) {
            data.cell.styles.textColor = [249, 115, 22];
          }
        }
      },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Page ${i} of ${pageCount} | Simple Budget Tracker | This is a computer-generated statement`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Save
    const filename = `statement_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
    toast.success('Bank statement PDF downloaded!');
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
                  onClick={handleExportPDF}
                  disabled={filteredTransactions.length === 0}
                  className="hidden sm:flex"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  PDF Statement
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  disabled={filteredTransactions.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  CSV
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
