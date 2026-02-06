import { TrendingUp, BarChart3, PieChart, ArrowUpRight, Wallet, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function AdminFinancials() {
  const financialMetrics = [
    { icon: TrendingUp, label: 'Revenue Analytics', description: 'Track income trends and growth patterns' },
    { icon: PieChart, label: 'Expense Breakdown', description: 'Visualize spending across categories' },
    { icon: Wallet, label: 'Cash Flow', description: 'Monitor incoming and outgoing funds' },
    { icon: CreditCard, label: 'Payment Reports', description: 'Detailed transaction histories' },
  ];

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <motion.div 
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                Financial Management
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Financials
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Revenue and expense tracking
            </p>
          </motion.div>

          {/* Financial Metrics */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {financialMetrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 group hover:border-emerald-500/30 cursor-pointer transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                    <metric.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-semibold text-lg">{metric.label}</h3>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-muted-foreground text-sm mt-1">{metric.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Coming Soon */}
          <motion.div 
            variants={itemVariants}
            className="rounded-2xl border border-border/50 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent backdrop-blur-sm p-8"
          >
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-10 h-10 text-emerald-400/50" />
              </div>
              <h3 className="font-display text-2xl font-semibold mb-2">Financial Reports Coming Soon</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Comprehensive financial analytics, reports, and insights are on the way.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
