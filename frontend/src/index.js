import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';
<<<<<<< HEAD
=======
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
>>>>>>> 2824bd05f5e0468b4a0aa0583fb5169e6434e350

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
<<<<<<< HEAD
    <App />
=======
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
>>>>>>> 2824bd05f5e0468b4a0aa0583fb5169e6434e350
  </React.StrictMode>
);
