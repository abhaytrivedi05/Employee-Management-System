import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllDepartments, deleteDepartment } from '../services/departmentService';
import { useAuth } from '../contexts/AuthContext';
import { Search, Plus, Download, Copy, Pencil, Trash2, Building2, ChevronLeft, ChevronRight } from 'lucide-react';

const DepartmentList = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    if (!session) return;
    const fetchData = async () => {
      setLoading(true);
      try { const data = await getAllDepartments(); setDepartments(data); }
      catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();
  }, [session]);

  const handleDelete = async id => {
    setDeletingId(id);
    try { await deleteDepartment(id); setDepartments(prev => prev.filter(d => d.id !== id)); }
    catch (err) { console.error(err); }
    setDeletingId(null);
  };

  const handleExportCsv = () => {
    const csv = ['Name,ID', ...departments.map(d => `"${d.name}","${d.id}"`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.setAttribute('download','departments.csv');
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const filtered = departments
    .filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => sortDirection === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalPages = Math.ceil(filtered.length / rowsPerPage);

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
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Dashboard / Departments</p>
          <h1 className="text-xl font-black text-foreground mt-0.5">Departments</h1>
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
          <Link to="/add-department">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary">
              <Plus size={13} /> New Department
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total', value: departments.length, color: 'stat-green', delay: 0.1 },
          { label: 'Visible', value: filtered.length, color: 'stat-blue', delay: 0.15 },
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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="card p-4 stat-amber flex flex-col justify-between">
          <p className="text-xs text-gray-500 font-medium">Quick add</p>
          <Link to="/add-department">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary text-xs mt-2 h-8 w-full">
              <Plus size={12} /> New
            </motion.button>
          </Link>
        </motion.div>
      </div>

      <div className="card p-3 flex flex-wrap gap-2 items-center">
        <div className="search-bar flex-1 min-w-48">
          <Search size={13} className="text-muted-foreground flex-shrink-0" />
          <input placeholder="Search departments..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(0); }} />
        </div>
        <select className="input h-9 w-auto text-xs" value={sortDirection} onChange={e => setSortDirection(e.target.value)}>
          <option value="asc">A → Z</option>
          <option value="desc">Z → A</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Department</th>
                <th className="hidden sm:table-cell">ID</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length ? paginated.map((dept, idx) => (
                <motion.tr key={dept.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
                        <Building2 size={15} className="text-green-600" />
                      </div>
                      <span className="font-semibold text-sm text-foreground">{dept.name}</span>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-secondary px-2 py-1 rounded-lg text-muted-foreground">{dept.id}</span>
                      <button onClick={() => navigator?.clipboard?.writeText(String(dept.id))} className="btn-ghost w-6 h-6 p-0 rounded"><Copy size={11} /></button>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-0.5">
                      <Link to={`/edit-department/${dept.id}`} className="btn-ghost w-7 h-7 p-0 rounded-lg flex items-center justify-center"><Pencil size={12} /></Link>
                      <button onClick={() => handleDelete(dept.id)} disabled={deletingId === dept.id} className="btn-danger w-7 h-7 p-0 rounded-lg">
                        {deletingId === dept.id ? <span className="w-3 h-3 border-2 border-red-300 border-t-red-500 rounded-full animate-spin block" /> : <Trash2 size={12} />}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )) : (
                <tr><td colSpan={3} className="py-16 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-3">
                    <Building2 size={22} className="text-green-400" />
                  </div>
                  <p className="font-semibold text-foreground text-sm">No departments found</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-gray-50/50">
            <p className="text-xs text-muted-foreground">{page * rowsPerPage + 1}–{Math.min((page+1)*rowsPerPage, filtered.length)} of {filtered.length}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => p-1)} disabled={page === 0} className="btn-ghost w-7 h-7 p-0 rounded-lg disabled:opacity-40"><ChevronLeft size={14} /></button>
              <button onClick={() => setPage(p => p+1)} disabled={page >= totalPages-1} className="btn-ghost w-7 h-7 p-0 rounded-lg disabled:opacity-40"><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DepartmentList;
