import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllEmployees, deleteEmployee } from '../services/employeeService';
import { getAllDepartments } from '../services/departmentService';
import { useAuth } from '../contexts/AuthContext';
import { Search, Plus, Download, Mail, Copy, Pencil, Trash2, SlidersHorizontal, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const AVATAR_COLORS = ['#2a9d6e','#2563eb','#7c3aed','#d97706','#db2777','#0891b2','#059669','#9333ea'];

const EmployeeList = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!session) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [data, deptData] = await Promise.all([getAllEmployees(), getAllDepartments()]);
        setEmployees(data); setDepartments(deptData);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();
  }, [session]);

  const handleDelete = async id => {
    setDeletingId(id);
    try { await deleteEmployee(id); setEmployees(prev => prev.filter(e => e.id !== id)); }
    catch (err) { console.error(err); }
    setDeletingId(null);
  };

  const handleExportCsv = () => {
    const csv = [['First Name','Last Name','Email','Age','Department'], ...employees.map(e => [e.firstName||'',e.lastName||'',e.email||'',e.age||'',e.department?.name||'Unassigned'])]
      .map(r => r.map(c => `"${c.toString().replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.setAttribute('download','employees.csv');
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const filtered = employees
    .filter(e => {
      const s = searchTerm.toLowerCase();
      return (e.firstName.toLowerCase().includes(s) || e.lastName.toLowerCase().includes(s) || e.email.toLowerCase().includes(s))
        && (departmentFilter === 'all' || String(e.department?.id) === departmentFilter)
        && (ageFilter === 'all' || (ageFilter === 'under30' && e.age < 30) || (ageFilter === '30to45' && e.age >= 30 && e.age <= 45) || (ageFilter === '45plus' && e.age > 45));
    })
    .sort((a, b) => {
      if (sortBy === 'age') return (a.age||0) - (b.age||0);
      if (sortBy === 'department') return (a.department?.name||'').localeCompare(b.department?.name||'');
      return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    });

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const activeFilters = [departmentFilter !== 'all', ageFilter !== 'all', sortBy !== 'name'].filter(Boolean).length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-4 border-green-100" />
        <div className="absolute inset-0 rounded-full border-4 border-t-green-500 animate-spin" />
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }} 
      className="space-y-4">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Dashboard / Employees</p>
          <h1 className="text-xl font-black text-foreground mt-0.5">Employees</h1>
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="flex gap-2">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExportCsv} 
            className="btn-secondary">
            <Download size={13} /> Export
          </motion.button>
          <Link to="/add-employee">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary">
              <Plus size={13} /> New Employee
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: employees.length, color: 'stat-green', delay: 0.1 },
          { label: 'Visible', value: filtered.length, color: 'stat-blue', delay: 0.15 },
          { label: 'Departments', value: departments.length, color: 'stat-amber', delay: 0.2 },
          { label: 'Avg Age', value: employees.length ? Math.round(employees.reduce((s,e)=>s+(e.age||0),0)/employees.length) : '—', color: 'stat-rose', delay: 0.25 },
        ].map(s => (
          <motion.div 
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: s.delay, duration: 0.4 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`card p-4 ${s.color}`}>
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            <motion.p 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: s.delay + 0.2, duration: 0.3 }}
              className="text-2xl font-black text-gray-900 mt-0.5">
              {s.value}
            </motion.p>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="card p-3 flex flex-wrap gap-2 items-center">
        <div className="search-bar flex-1 min-w-48">
          <Search size={13} className="text-muted-foreground flex-shrink-0" />
          <input placeholder="Search employee..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(0); }} />
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFilters(f => !f)}
          className={`btn-secondary relative ${showFilters ? 'border-green-400 text-green-600 bg-green-50' : ''}`}>
          <SlidersHorizontal size={13} /> Filter
          {activeFilters > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-green-500 text-white text-[9px] font-bold flex items-center justify-center">
              {activeFilters}
            </motion.span>
          )}
        </motion.button>
        <select className="input h-9 w-auto text-xs" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="name">Sort: Name</option>
          <option value="department">Sort: Dept</option>
          <option value="age">Sort: Age</option>
        </select>
      </motion.div>

      {showFilters && (
        <motion.div 
          initial={{ opacity: 0, height: 0, y: -10 }} 
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="card p-3 flex flex-wrap gap-2">
          <Select value={departmentFilter} onValueChange={v => { setDepartmentFilter(v); setPage(0); }}>
            <SelectTrigger className="w-44 h-9 text-sm bg-white border-border"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={ageFilter} onValueChange={v => { setAgeFilter(v); setPage(0); }}>
            <SelectTrigger className="w-36 h-9 text-sm bg-white border-border"><SelectValue placeholder="Age" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ages</SelectItem>
              <SelectItem value="under30">Under 30</SelectItem>
              <SelectItem value="30to45">30–45</SelectItem>
              <SelectItem value="45plus">45+</SelectItem>
            </SelectContent>
          </Select>
          {activeFilters > 0 && (
            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-ghost text-xs text-red-500 hover:bg-red-50" 
              onClick={() => { setDepartmentFilter('all'); setAgeFilter('all'); setSortBy('name'); }}>
              Clear filters
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th className="hidden md:table-cell">Email</th>
                <th className="hidden sm:table-cell">Department</th>
                <th className="hidden lg:table-cell">Age</th>
                <th className="hidden sm:table-cell">Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length ? paginated.map((emp, idx) => (
                <motion.tr key={emp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}>
                        {(emp.firstName?.[0]||'') + (emp.lastName?.[0]||'')}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-muted-foreground sm:hidden">{emp.department?.name || 'Unassigned'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell text-muted-foreground">{emp.email}</td>
                  <td className="hidden sm:table-cell text-foreground">{emp.department?.name || 'Unassigned'}</td>
                  <td className="hidden lg:table-cell text-foreground font-medium">{emp.age}</td>
                  <td className="hidden sm:table-cell">
                    <span className="badge-active text-[11px] font-semibold px-2.5 py-1 rounded-full">Active</span>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-0.5">
                      <button onClick={() => navigator?.clipboard?.writeText(emp.email)} title="Copy email" className="btn-ghost w-7 h-7 p-0 rounded-lg"><Copy size={12} /></button>
                      <button onClick={() => window.location.href=`mailto:${emp.email}`} title="Email" className="btn-ghost w-7 h-7 p-0 rounded-lg"><Mail size={12} /></button>
                      <Link to={`/edit-employee/${emp.id}`} className="btn-ghost w-7 h-7 p-0 rounded-lg flex items-center justify-center"><Pencil size={12} /></Link>
                      <button onClick={() => handleDelete(emp.id)} disabled={deletingId === emp.id} className="btn-danger w-7 h-7 p-0 rounded-lg">
                        {deletingId === emp.id ? <span className="w-3 h-3 border-2 border-red-300 border-t-red-500 rounded-full animate-spin block" /> : <Trash2 size={12} />}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-3">
                      <Users size={22} className="text-green-400" />
                    </div>
                    <p className="font-semibold text-foreground text-sm">No employees found</p>
                    <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-gray-50/50">
          <p className="text-xs text-muted-foreground">
            Show <select className="border border-border rounded px-1 py-0.5 text-xs mx-1 bg-white" value={rowsPerPage} readOnly><option>{rowsPerPage}</option></select>
            of {filtered.length} results
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 0} className="btn-ghost w-7 h-7 p-0 rounded-lg disabled:opacity-40"><ChevronLeft size={14} /></button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
              <button key={i} onClick={() => setPage(i)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${page === i ? 'bg-green-500 text-white' : 'btn-ghost'}`}>
                {i + 1}
              </button>
            ))}
            {totalPages > 5 && <span className="text-xs text-muted-foreground px-1">...</span>}
            <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1} className="btn-ghost w-7 h-7 p-0 rounded-lg disabled:opacity-40"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EmployeeList;
