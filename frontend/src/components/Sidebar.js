import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Building2, User,
  LogIn, UserPlus, LogOut, Menu, X, Home,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

const navItems = [
  { label: 'Home',        icon: Home,            path: '/' },
  { label: 'Dashboard',   icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Employees',   icon: Users,           path: '/employees' },
  { label: 'Departments', icon: Building2,       path: '/departments' },
  { label: 'Profile',     icon: User,            path: '/profile' },
];

const NavLink = ({ item, isActive, onClick }) => (
  <Link to={item.path} onClick={onClick} className={cn('sidebar-link', isActive && 'active')}>
    <item.icon size={17} className="nav-icon flex-shrink-0" />
    <span>{item.label}</span>
    {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400" />}
  </Link>
);

const Sidebar = ({ mobile = false, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const isLoggedIn = !!session;
  const email = session?.user?.email || '';

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
    if (onClose) onClose();
  };

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-sidebar-border">
        <Link to="/" onClick={onClose} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-green-500 flex items-center justify-center">
            <Users size={15} className="text-white" />
          </div>
          <div>
            <p className="font-black text-white text-sm tracking-tight leading-none">TeamHub</p>
            <p className="text-[10px] text-sidebar-muted mt-0.5">HR Management</p>
          </div>
        </Link>
        {mobile && (
          <button onClick={onClose} className="text-sidebar-muted hover:text-white p-1">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold text-sidebar-muted uppercase tracking-widest px-3 mb-3">Menu</p>
        {navItems.map(item => (
          <NavLink key={item.path} item={item} isActive={location.pathname === item.path} onClick={onClose} />
        ))}

        <div className="pt-5">
          <p className="text-[10px] font-bold text-sidebar-muted uppercase tracking-widest px-3 mb-3">Account</p>
          {!isLoggedIn ? (
            <>
              <NavLink item={{ label: 'Login', icon: LogIn, path: '/login' }} isActive={location.pathname === '/login'} onClick={onClose} />
              <NavLink item={{ label: 'Register', icon: UserPlus, path: '/register' }} isActive={location.pathname === '/register'} onClick={onClose} />
            </>
          ) : (
            <button onClick={handleLogout} className="sidebar-link w-full text-left !text-red-400 hover:!bg-red-500/10">
              <LogOut size={17} className="flex-shrink-0" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </nav>

      {/* Promo card */}
      {!isLoggedIn && (
        <div className="mx-3 mb-3 p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #1a4731, #0f3d28)' }}>
          <p className="text-xs font-bold text-white mb-1">Level Up Your HR</p>
          <p className="text-[11px] text-white/50 mb-3">Get full control with advanced modules.</p>
          <Link to="/register" onClick={onClose} className="block text-center text-xs font-bold py-2 rounded-lg bg-green-500 text-white hover:bg-green-400 transition-colors">
            Get Started Free
          </Link>
        </div>
      )}

      {/* User */}
      {isLoggedIn && email && (
        <div className="px-3 py-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-sidebar-hover transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{email}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <p className="text-[10px] text-sidebar-muted">Online · Admin</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const MobileSidebar = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
        <Menu size={20} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed left-0 top-0 z-50 h-full w-60">
              <Sidebar mobile onClose={() => setOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
