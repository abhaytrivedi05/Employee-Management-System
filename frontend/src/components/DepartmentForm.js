import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { addDepartment, getDepartmentById, updateDepartment } from '../services/departmentService';
import { ArrowLeft, Save } from 'lucide-react';

const DepartmentForm = () => {
  const [department, setDepartment] = useState({ name: '' });
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setIsLoading(true);
      try { const data = await getDepartmentById(id); setDepartment(data); }
      catch (err) { console.error(err); }
      setIsLoading(false);
    };
    fetchData();
  }, [id]);

  const handleSubmit = async e => {
    e.preventDefault(); setIsLoading(true);
    try {
      if (id) await updateDepartment(id, department);
      else await addDepartment(department);
      navigate('/departments');
    } catch (err) { console.error(err); }
    setIsLoading(false);
  };

  if (isLoading) return (
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
      transition={{ duration: 0.5 }}>
      <div className="max-w-md mx-auto space-y-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex items-center gap-3">
          <Link to="/departments">
            <motion.button
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.9 }}
              className="btn-ghost w-8 h-8 p-0 rounded-lg flex items-center justify-center">
              <ArrowLeft size={16} />
            </motion.button>
          </Link>
          <div>
            <p className="text-xs text-muted-foreground">Departments / {id ? 'Edit' : 'New'}</p>
            <h1 className="text-xl font-black text-foreground">{id ? 'Edit Department' : 'Add Department'}</h1>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          whileHover={{ y: -2 }}
          className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Department Name</label>
              <input name="name" value={department.name} onChange={e => setDepartment({ ...department, name: e.target.value })} required placeholder="e.g. Engineering" className="input" />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="flex gap-2 pt-2">
              <motion.button 
                type="submit" 
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="btn-primary flex-1 h-10">
                <Save size={14} /> {id ? 'Update' : 'Save Department'}
              </motion.button>
              <motion.button 
                type="button" 
                onClick={() => navigate('/departments')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-secondary h-10">
                Cancel
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DepartmentForm;
