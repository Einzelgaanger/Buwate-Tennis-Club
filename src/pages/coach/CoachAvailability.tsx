import { Clock, Plus, Calendar, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function CoachAvailability() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  return (
    <ProtectedRoute allowedRoles={['coach']}>
      <DashboardLayout>
        <motion.div 
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  Schedule Management
                </span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Availability
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Set your weekly availability for coaching sessions
              </p>
            </div>
            <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Add Time Slot
            </Button>
          </motion.div>

          {/* Days Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {days.map((day, index) => (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 group hover:border-primary/30 transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-blue-500/10 group-hover:bg-primary/10 transition-colors">
                    <Calendar className="w-5 h-5 text-blue-400 group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-display font-semibold text-lg">{day}</h3>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground mb-4 min-h-[60px]">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30">
                    <Clock className="w-4 h-4" />
                    <p>No availability set</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full rounded-xl border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all">
                  <Plus className="w-3 h-3 mr-2" />
                  Add Slot
                </Button>
              </motion.div>
            ))}
          </motion.div>

          {/* Info Card */}
          <motion.div 
            variants={itemVariants}
            className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-transparent to-transparent backdrop-blur-sm p-6"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg mb-2">Pro Tip</h3>
                <p className="text-muted-foreground">
                  Setting consistent availability helps students find and book sessions with you more easily. 
                  You can always block specific dates for holidays or personal time.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
