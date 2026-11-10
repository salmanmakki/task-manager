import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: 'var(--tf-surface)',
            color: 'var(--tf-ink)',
            border: '1px solid var(--tf-line)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-soft)',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: 'var(--tf-success)', secondary: 'var(--tf-surface)' } },
          error: { iconTheme: { primary: 'var(--tf-danger)', secondary: 'var(--tf-surface)' } },
        }}
      />
    </BrowserRouter>
  </StrictMode>
);
