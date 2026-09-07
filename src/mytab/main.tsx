import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/index.css';

import { loadAppState } from '../services/storage';
import { ErrorBoundary } from './components/ErrorBoundary';

loadAppState().then((initialState) => {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App initialState={initialState} />
      </ErrorBoundary>
    </React.StrictMode>
  );
});
