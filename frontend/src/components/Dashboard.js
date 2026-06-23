import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { getAllEmployees } from '../services/employeeService';
import { getAllDepartments } from '../services/departmentService';
import {
  Chart, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Users, Building2, TrendingUp, UserCheck, Plus, ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

Chart.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const CHART_TOOLTIP = {
  backgroundColor: '#fff',
  titleColor: '#171c26',
  bodyColor: '#6b7280',
  borderColor: '#e5e7eb',
  borderWidth: 1,
  padding: 10,
  cornerRadius: 8,
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
};

const DEPT_COLORS = ['#1a4731','#2a9d6e','#4ade80','#86efac','#bbf7d0','#d1fae5'];

const StatCard = ({ title, value, change, positive, subtitle, colorClass, icon: Icon, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20, scale: 0.95 }} 
    animate={{ opacity: 1, y: 0, scale: 1 }} 
    transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
    whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
    className={`card p-5 ${colorClass} cursor-pointer`}>
    <div className="flex items-start justify-between mb-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
      <motion.div 
        whileHover={{ rotate: 360, scale: 1.1 }}
        transition={{ duration: 0.5 }}
        className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center">
        <Icon size={15} className="text-gray-600" />
      </motion.div>
    </div>
    <motion.p 
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: delay + 0.2, duration: 0.4 }}
      className="text-3xl font-black text-gray-900 mb-1">
      {value}
    </motion.p>
    <div className="flex items-center gap-1.5">
      {change && (
        <motion.span 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: delay + 0.3 }}
          className={`flex items-center gap-0.5 text-xs font-semibold ${positive ? 'text-green-600' : 'text-red-500'}`}>
          {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {change}
        </motion.span>
      )}
      <span className="text-xs text-gray-400">{subtitle}</span>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ageRanges, setAgeRanges] = useState({});
  const [deptMap, setDeptMap] = useState({});
  const [growth, setGrowth] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [emps, depts] = await Promise.all([getAllEmployees(), getAllDepartments()]);
      setEmployees(emps);
      setDepartments(depts);

      const ranges = { '20-29': 0, '30-39': 0, '40-49': 0, '50-59': 0, '60+': 0 };
      emps.forEach(e => {
        if (e.age < 30) ranges['20-29']++;
        else if (e.age < 40) ranges['30-39']++;
        else if (e.age < 50) ranges['40-49']++;
        else if (e.age < 60) ranges['50-59']++;
        else ranges['60+']++;
      });
      setAgeRanges(ranges);

      const dm = emps.reduce((acc, e) => {
        const n = e.department?.name || 'Unassigned';
        acc[n] = (acc[n] || 0) + 1;
        return acc;
      }, {});
      setDeptMap(dm);

      setGrowth([
        { month: 'Jan', count: 50 }, { month: 'Feb', count: 70 }, { month: 'Mar', count: 100 },
        { month: 'Apr', count: 130 }, { month: 'May', count: 160 }, { month: 'Jun', count: 200 },
      ]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const avgAge = employees.length ? (employees.reduce((s, e) => s + e.age, 0) / employees.length).toFixed(1) : 0;
  const avgTeamSize = departments.length ? (employees.length / departments.length).toFixed(1) : 0;
  const recent = [...employees].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 8);

  const deptEntries = Object.entries(deptMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const total = deptEntries.reduce((s, [, v]) => s + v, 0);

  const doughnutData = {
    labels: deptEntries.map(([k]) => k),
    datasets: [{
      data: deptEntries.map(([, v]) => v),
      backgroundColor: DEPT_COLORS,
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const lineData = {
    labels: growth.map(d => d.month),
    datasets: [{
      label: 'Employees',
      data: growth.map(d => d.count),
      borderColor: '#2a9d6e',
      backgroundColor: 'rgba(42,157,110,0.08)',
      borderWidth: 2.5,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#2a9d6e',
      pointBorderWidth: 2,
      pointRadius: 4,
    }],
  };

  const lineOpts = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: CHART_TOOLTIP },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 11 } } },
      y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: '#9ca3af', font: { size: 11 } }, beginAtZero: true },
    },
  };

  const AVATAR_COLORS = ['#2a9d6e','#2563eb','#7c3aed','#d97706','#db2777','#0891b2'];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-4 border-green-100" />
        <div className="absolute inset-0 rounded-full border-4 border-t-green-500 animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="space-y-5 animate-in">
      {/* Page header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Dashboard / Overview</p>
          <h1 className="text-xl font-black text-foreground mt-0.5">Employees</h1>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/add-employee')} 
          className="btn-primary">
          <Plus size={14} /> New Employee
        </motion.button>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={employees.length} change="+0.8%" positive subtitle="from last month" colorClass="stat-green" icon={Users} delay={0} />
        <StatCard title="New This Month" value={7} change="+0.8%" positive subtitle="from last month" colorClass="stat-blue" icon={UserCheck} delay={0.06} />
        <StatCard title="Departments" value={departments.length} subtitle="active units" colorClass="stat-amber" icon={Building2} delay={0.12} />
        <StatCard title="Avg Team Size" value={avgTeamSize} subtitle="employees/dept" colorClass="stat-rose" icon={TrendingUp} delay={0.18} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Growth line */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          whileHover={{ y: -4 }}
          className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Headcount Growth</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Jan – Jun 2024</p>
            </div>
            <motion.button 
              whileHover={{ rotate: 90 }}
              className="btn-ghost w-7 h-7 p-0 rounded-full">
              <MoreHorizontal size={15} />
            </motion.button>
          </div>
          <Line data={lineData} options={lineOpts} />
        </motion.div>

        {/* Departments donut */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          whileHover={{ y: -4 }}
          className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">Departments</h3>
            <select className="text-xs border border-border rounded-lg px-2 py-1 bg-secondary text-foreground outline-none">
              <option>This Month</option>
            </select>
          </div>
          {deptEntries.length > 0 ? (
            <>
              <div className="relative flex justify-center mb-4">
                <div style={{ width: 160, height: 160 }}>
                  <Doughnut data={doughnutData} options={{
                    cutout: '68%',
                    plugins: { legend: { display: false }, tooltip: CHART_TOOLTIP },
                  }} />
                </div>
              </div>
              <div className="space-y-2">
                {deptEntries.map(([name, count], i) => (
                  <div key={name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: DEPT_COLORS[i] }} />
                      <span className="text-foreground font-medium truncate max-w-[100px]">{name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>{count}</span>
                      <span className="text-[10px]">{total ? Math.round(count / total * 100) : 0}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No department data yet</p>
          )}
        </motion.div>
      </div>

      {/* Employee list */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-bold text-foreground">Employee List</h3>
          <button onClick={() => navigate('/employees')} className="btn-secondary text-xs">
            View all <ArrowUpRight size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th className="hidden md:table-cell">Department</th>
                <th className="hidden lg:table-cell">Age</th>
                <th className="hidden sm:table-cell">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.length ? recent.map((emp, i) => (
                <tr key={emp.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                        {(emp.firstName?.[0] || '') + (emp.lastName?.[0] || '')}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-muted-foreground">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell">
                    <span className="text-sm text-foreground">{emp.department?.name || 'Unassigned'}</span>
                  </td>
                  <td className="hidden lg:table-cell text-sm text-foreground">{emp.age}</td>
                  <td className="hidden sm:table-cell">
                    <span className="badge-active text-[11px] font-semibold px-2.5 py-1 rounded-full">Active</span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="text-center py-10 text-muted-foreground text-sm">No employees yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
