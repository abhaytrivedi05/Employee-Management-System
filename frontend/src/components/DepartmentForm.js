import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { addDepartment, getDepartmentById, updateDepartment } from '../services/departmentService';
import { TextField, Button, CircularProgress, Box, Paper, Typography, Stack } from '@mui/material';

const DepartmentForm = () => {
  const [department, setDepartment] = useState({ name: '' });
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false); // State for loading

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        setIsLoading(true); // Start loading
        try {
          const departmentData = await getDepartmentById(id);
          setDepartment(departmentData);
        } catch (error) {
          console.error('Error fetching department data:', error);
        } finally {
          setIsLoading(false); // Stop loading
        }
      }
    };
    fetchData();
  }, [id]);

  const handleChange = e => {
    setDepartment({ ...department, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    try {
      if (id) {
        await updateDepartment(id, department);
      } else {
        await addDepartment(department);
      }
      setIsLoading(false); // Stop loading
      navigate('/departments');
    } catch (error) {
      console.error('Error saving department:', error);
      setIsLoading(false); // Stop loading
    }
  };

  // If loading, show centered spinner
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Box sx={{ maxWidth: 500, margin: '0 auto', padding: 3 }}>
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(15, 23, 42, 0.15)',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, marginBottom: 3, textAlign: 'center' }}>
            {id ? 'Edit Department' : 'Add Department'}
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <TextField label="Department Name" name="name" value={department.name} onChange={handleChange} required fullWidth />
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ paddingY: 1.5, fontWeight: 600, fontSize: '1rem' }}>
                  Save Department
                </Button>
              </motion.div>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </motion.div>
  );
};

export default DepartmentForm;
