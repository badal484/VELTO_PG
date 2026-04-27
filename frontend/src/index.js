import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif', fontSize: '14px' },
          success: { duration: 4000, iconTheme: { primary: '#008A05', secondary: '#fff' } },
          error: { duration: 5000, iconTheme: { primary: '#C13515', secondary: '#fff' } },
        }}
      />
    </HelmetProvider>
  </React.StrictMode>
);