import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { addEmployee, getEmployeeById, updateEmployee } from '../services/employeeService';
import { getAllDepartments } from '../services/departmentService';
import { ArrowLeft, Save } from 'lucide-react';

const EmployeeForm = () => {
  const [employee, setEmployee] = useState({ firstName: '', lastName: '', email: '', age: '', department: { id: '' } });
  const [departments, setDepartments] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const depts = await getAllDepartments();
        setDepartments(depts);
        if (id) {
          const data = await getEmployeeById(id);
          if (data) setEmployee({ firstName: data.firstName||'', lastName: data.lastName||'', email: data.email||'', age: data.age||'', department: { id: data.department?.id||'' } });
        }
      } catch (err) { console.error(err); }
      setIsLoading(false);
    };
    fetchData();
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'department.id') setEmployee({ ...employee, department: { id: value } });
    else setEmployee({ ...employee, [name]: name === 'age' ? Number(value) : value });
  };

  const handleSubmit = async e => {
    e.preventDefault(); setIsLoading(true);
    try {
      if (id) await updateEmployee(id, employee);
      else await addEmployee(employee);
      navigate('/employees');
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
      <div className="max-w-lg mx-auto space-y-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex items-center gap-3">
          <Link to="/employees">
            <motion.button
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.9 }}
              className="btn-ghost w-8 h-8 p-0 rounded-lg flex items-center justify-center">
              <ArrowLeft size={16} />
            </motion.button>
          </Link>
          <div>
            <p className="text-xs text-muted-foreground">Employees / {id ? 'Edit' : 'New'}</p>
            <h1 className="text-xl font-black text-foreground">{id ? 'Edit Employee' : 'Add Employee'}</h1>
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
              className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">First Name</label>
                <input name="firstName" value={employee.firstName} onChange={handleChange} required placeholder="John" className="input" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Last Name</label>
                <input name="lastName" value={employee.lastName} onChange={handleChange} required placeholder="Doe" className="input" />
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Email</label>
              <input name="email" type="email" value={employee.email} onChange={handleChange} required placeholder="john@example.com" className="input" />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Age</label>
              <input name="age" type="number" value={employee.age} onChange={handleChange} required min={1} max={150} placeholder="30" className="input" />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Department</label>
              <select name="department.id" value={employee.department.id || ''} onChange={handleChange} required className="input">
                <option value="">Select a department</option>
                {departments.length === 0
                  ? <option disabled>No departments — create one first</option>
                  : departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)
                }
              </select>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="flex gap-2 pt-2">
              <motion.button 
                type="submit" 
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="btn-primary flex-1 h-10">
                <Save size={14} /> {id ? 'Update Employee' : 'Save Employee'}
              </motion.button>
              <motion.button 
                type="button" 
                onClick={() => navigate('/employees')}
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

export default EmployeeForm;
