import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import Sidebar, { MobileSidebar } from './components/Sidebar';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import EmployeeForm from './components/EmployeeForm';
import DepartmentList from './components/DepartmentList';
import DepartmentForm from './components/DepartmentForm';
import LandingPage from './components/LandingPage';
import Profile from './components/Profile';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import ResetPassword from './components/ResetPassword';
import VerifyEmail from './components/VerifyEmail';
import NotFoundPage from './components/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import QuickActions from './components/QuickActions';
import { Search, Bell, Settings } from 'lucide-react';

const AUTH_PATHS = ['/login', '/register', '/reset-password', '/verify-email'];

const Topbar = () => {
  const { user } = useAuth();
  const email = user?.email || '';
  return (
    <div className="topbar">
      <div className="lg:hidden"><MobileSidebar /></div>
      <div className="search-bar flex-1 max-w-xs hidden sm:flex">
        <Search size={14} className="text-muted-foreground flex-shrink-0" />
        <input placeholder="Search anything..." />
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <button className="btn-ghost w-8 h-8 p-0 rounded-full relative">
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
        </button>
        <button className="btn-ghost w-8 h-8 p-0 rounded-full">
          <Settings size={16} />
        </button>
        {email && (
          <Link to="/profile" className="flex items-center gap-2 pl-2 border-l border-border">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-xs font-bold text-white">
              {email[0].toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-foreground leading-none">{email.split('@')[0]}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">User</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};

const AppLayout = () => {
  const location = useLocation();
  const isAuthPage = AUTH_PATHS.includes(location.pathname);

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:flex sticky top-0 h-screen">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-5 md:p-6">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/employees" element={<ProtectedRoute><EmployeeList /></ProtectedRoute>} />
            <Route path="/add-employee" element={<ProtectedRoute><EmployeeForm /></ProtectedRoute>} />
            <Route path="/edit-employee/:id" element={<ProtectedRoute><EmployeeForm /></ProtectedRoute>} />
            <Route path="/departments" element={<ProtectedRoute><DepartmentList /></ProtectedRoute>} />
            <Route path="/add-department" element={<ProtectedRoute><DepartmentForm /></ProtectedRoute>} />
            <Route path="/edit-department/:id" element={<ProtectedRoute><DepartmentForm /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <QuickActions />
    </div>
  );
};

const App = () => (
  <ThemeProvider>
    <Router>
      <AppLayout />
    </Router>
  </ThemeProvider>
);

export default App;
