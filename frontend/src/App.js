import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
<<<<<<< HEAD
import { Container, CssBaseline } from '@mui/material';
import { ThemeProvider } from './contexts/ThemeContext';
=======
import { Container, CssBaseline, ThemeProvider } from '@mui/material';
import theme from './theme';
>>>>>>> 2824bd05f5e0468b4a0aa0583fb5169e6434e350
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import EmployeeForm from './components/EmployeeForm';
import DepartmentList from './components/DepartmentList';
import DepartmentForm from './components/DepartmentForm';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Profile from './components/Profile';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import ResetPassword from './components/ResetPassword';
import VerifyUsername from './components/VerifyUsername';
import NotFoundPage from './components/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import QuickActions from './components/QuickActions';

const App = () => {
  return (
<<<<<<< HEAD
    <ThemeProvider>
=======
    <ThemeProvider theme={theme}>
>>>>>>> 2824bd05f5e0468b4a0aa0583fb5169e6434e350
      <CssBaseline />
      <Router>
        <Navbar />
        <Container maxWidth="lg" style={{ marginTop: '2rem', marginBottom: '2.5rem' }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <ProtectedRoute>
                  <EmployeeList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-employee"
              element={
                <ProtectedRoute>
                  <EmployeeForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-employee/:id"
              element={
                <ProtectedRoute>
                  <EmployeeForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/departments"
              element={
                <ProtectedRoute>
                  <DepartmentList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-department"
              element={
                <ProtectedRoute>
                  <DepartmentForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-department/:id"
              element={
                <ProtectedRoute>
                  <DepartmentForm />
                </ProtectedRoute>
              }
            />
            <Route path="/verify-username" element={<VerifyUsername />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Container>
        <QuickActions />
        <Footer />
      </Router>
    </ThemeProvider>
  );
};

export default App;
