import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LayoutDashboard, UserPlus, Building2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const actions = [
  { icon: LayoutDashboard, label: 'Dashboard',      path: '/dashboard',      color: 'bg-green-500' },
  { icon: UserPlus,        label: 'Add Employee',   path: '/add-employee',   color: 'bg-blue-500' },
  { icon: Building2,       label: 'Add Department', path: '/add-department', color: 'bg-violet-500' },
];

const QuickActions = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && actions.map((action, i) => (
          <motion.button key={action.label}
            initial={{ opacity: 0, y: 8, scale: 0.85 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.85 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => { navigate(action.path); setOpen(false); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-white text-xs font-semibold shadow-lg ${action.color} hover:opacity-90 transition-opacity`}
          >
            <action.icon size={13} /> {action.label}
          </motion.button>
        ))}
      </AnimatePresence>
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setOpen(o => !o)}
        className="w-11 h-11 rounded-xl bg-green-500 text-white shadow-green flex items-center justify-center hover:bg-green-600 transition-colors"
        aria-label="Quick actions"
      >
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
          <Plus size={20} />
        </motion.div>
      </motion.button>
    </div>
  );
};

export default QuickActions;
