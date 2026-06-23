import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllEmployees } from '../services/employeeService';
import { getAllDepartments } from '../services/departmentService';
import { LogOut, Download, Users, Building2, BarChart3, Plus, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [employeeCount, setEmployeeCount] = useState(0);
  const [departmentCount, setDepartmentCount] = useState(0);
  const [averageAge, setAverageAge] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [employees, departments] = await Promise.all([getAllEmployees(), getAllDepartments()]);
        setEmployeeCount(employees.length);
        setDepartmentCount(departments.length);
        const totalAge = employees.reduce((s, e) => s + e.age, 0);
        setAverageAge(employees.length ? (totalAge / employees.length).toFixed(1) : 0);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (!user) return (
    <div className="max-w-md mx-auto mt-16 card p-6 text-center">
      <p className="text-sm text-muted-foreground mb-3">You must be logged in to view your profile.</p>
      <button onClick={() => navigate('/login')} className="btn-primary">Login</button>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-4 border-green-100" />
        <div className="absolute inset-0 rounded-full border-4 border-t-green-500 animate-spin" />
      </div>
    </div>
  );

  const email = user?.email || '';
  const handleLogout = async () => { await signOut(); navigate('/login'); };
  const handleExportSnapshot = () => {
    const rows = [['Username', email], ['Employees', employeeCount], ['Departments', departmentCount], ['Average Age', averageAge], ['Generated At', new Date().toISOString()]];
    const csv = ['Field,Value', ...rows.map(r => `"${r[0]}","${r[1]}"`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.setAttribute('download', 'profile-snapshot.csv');
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
      <div>
        <p className="text-xs text-muted-foreground">Dashboard / Profile</p>
        <h1 className="text-xl font-black text-foreground mt-0.5">Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-6 flex flex-col items-center text-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-green-500 flex items-center justify-center text-3xl font-black text-white">
            {email[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-bold text-foreground truncate max-w-[200px]">{email}</p>
            <div className="flex gap-1.5 justify-center mt-2">
              <span className="badge-active text-[11px] font-semibold px-2.5 py-1 rounded-full">Active</span>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-secondary text-muted-foreground border border-border">Admin</span>
            </div>
          </div>
          <div className="w-full border-t border-border pt-4 space-y-2">
            <button onClick={handleExportSnapshot} className="btn-secondary w-full h-9 text-xs">
              <Download size={13} /> Export snapshot
            </button>
            <button onClick={handleLogout} className="w-full h-9 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5">
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-bold text-foreground mb-4">Organization Pulse</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Employees', value: employeeCount, icon: Users, color: 'stat-green' },
                { label: 'Departments', value: departmentCount, icon: Building2, color: 'stat-blue' },
                { label: 'Avg Age', value: averageAge, icon: BarChart3, color: 'stat-amber' },
              ].map(item => (
                <div key={item.label} className={`card p-3 ${item.color}`}>
                  <item.icon size={14} className="text-gray-500 mb-1.5" />
                  <p className="text-xl font-black text-gray-900">{item.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-bold text-foreground mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              <Link to="/add-employee" className="btn-secondary text-xs h-8"><Plus size={12} /> Add employee</Link>
              <Link to="/add-department" className="btn-secondary text-xs h-8"><Plus size={12} /> New department</Link>
              <Link to="/dashboard" className="btn-secondary text-xs h-8"><LayoutDashboard size={12} /> Dashboard</Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
