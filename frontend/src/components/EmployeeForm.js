import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
<<<<<<< HEAD
import { motion } from 'framer-motion';
import { addEmployee, getEmployeeById, updateEmployee } from '../services/employeeService';
import { getAllDepartments } from '../services/departmentService';
import { TextField, Button, MenuItem, Box, CircularProgress, Paper, Typography, Stack } from '@mui/material';
=======
import { addEmployee, getEmployeeById, updateEmployee } from '../services/employeeService';
import { getAllDepartments } from '../services/departmentService';
import { TextField, Button, MenuItem, Box, CircularProgress } from '@mui/material';
>>>>>>> 2824bd05f5e0468b4a0aa0583fb5169e6434e350
import { styled } from '@mui/system';

const CenteredSpinner = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
});

const EmployeeForm = () => {
  const [employee, setEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    department: { id: '' },
  });
  const [departments, setDepartments] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
<<<<<<< HEAD
        console.log('Fetching departments...');
        const departmentsData = await getAllDepartments();
        console.log('Departments fetched:', departmentsData);
        setDepartments(departmentsData);

        if (id) {
          console.log('Fetching employee with id:', id);
          const employeeData = await getEmployeeById(id);
          console.log('Employee fetched:', employeeData);
=======
        const departmentsData = await getAllDepartments();
        setDepartments(departmentsData);

        if (id) {
          const employeeData = await getEmployeeById(id);
>>>>>>> 2824bd05f5e0468b4a0aa0583fb5169e6434e350
          if (employeeData) {
            setEmployee({
              firstName: employeeData.firstName || '',
              lastName: employeeData.lastName || '',
              email: employeeData.email || '',
              age: employeeData.age || '',
              department: {
                id: employeeData.department ? employeeData.department.id : '',
              },
            });
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
<<<<<<< HEAD
        console.error('Error details:', error.response?.data || error.message);
=======
>>>>>>> 2824bd05f5e0468b4a0aa0583fb5169e6434e350
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'department.id') {
      setEmployee({ ...employee, department: { id: value } });
    } else {
      setEmployee({
        ...employee,
        [name]: name === 'age' ? Number(value) : value, // Convert age to number
      });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (id) {
        await updateEmployee(id, employee);
      } else {
        await addEmployee(employee);
      }
      setIsLoading(false);
      navigate('/employees');
    } catch (error) {
      console.error('Error saving employee:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <CenteredSpinner>
        <CircularProgress />
      </CenteredSpinner>
    );
  }

  return (
<<<<<<< HEAD
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Box sx={{ maxWidth: 600, margin: '0 auto', padding: 3 }}>
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(15, 23, 42, 0.15)',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, marginBottom: 3, textAlign: 'center' }}>
            {id ? 'Edit Employee' : 'Add Employee'}
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <TextField label="First Name" name="firstName" value={employee.firstName} onChange={handleChange} required fullWidth />
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <TextField label="Last Name" name="lastName" value={employee.lastName} onChange={handleChange} required fullWidth />
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <TextField label="Email" name="email" type="email" value={employee.email} onChange={handleChange} required fullWidth />
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <TextField label="Age" name="age" type="number" value={employee.age} onChange={handleChange} required fullWidth inputProps={{ min: 1, max: 150 }} />
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <TextField select label="Department" name="department.id" value={employee.department.id || ''} onChange={handleChange} required fullWidth>
                  <MenuItem value="">Select Department</MenuItem>
                  {departments.length === 0 ? (
                    <MenuItem disabled>No departments available - Please create one first</MenuItem>
                  ) : (
                    departments.map(department => (
                      <MenuItem key={department.id} value={department.id}>
                        {department.name}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ paddingY: 1.5, fontWeight: 600, fontSize: '1rem' }}>
                  Save Employee
                </Button>
              </motion.div>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </motion.div>
=======
    <Box component="form" onSubmit={handleSubmit} sx={{ '& .MuiTextField-root': { marginBottom: '1rem', width: '100%' } }}>
      <h2>{id ? 'Edit Employee' : 'Add Employee'}</h2>
      <TextField label="First Name" name="firstName" value={employee.firstName} onChange={handleChange} required />
      <TextField label="Last Name" name="lastName" value={employee.lastName} onChange={handleChange} required />
      <TextField label="Email" name="email" type="email" value={employee.email} onChange={handleChange} required />
      <TextField label="Age" name="age" type="number" value={employee.age} onChange={handleChange} required inputProps={{ min: 1, max: 150 }} />
      <TextField select label="Department" name="department.id" value={employee.department.id || ''} onChange={handleChange} required>
        <MenuItem value="">Select Department</MenuItem>
        {departments.map(department => (
          <MenuItem key={department.id} value={department.id}>
            {department.name}
          </MenuItem>
        ))}
      </TextField>
      <Button type="submit" variant="contained" color="primary" sx={{ marginTop: '1rem' }}>
        Save
      </Button>
    </Box>
>>>>>>> 2824bd05f5e0468b4a0aa0583fb5169e6434e350
  );
};

export default EmployeeForm;
