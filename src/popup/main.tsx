import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import '../mytab/styles/index.css'; // Reuse global styles

// Synchronous theme initialization from localStorage or system preference to prevent flash
try {
  const cachedMode = localStorage.getItem('mytab_theme_mode');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = cachedMode === 'dark' || (cachedMode === 'system' && prefersDark) || (!cachedMode && prefersDark);
  if (isDark) {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
  }
} catch (e) {
  // ignore
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
