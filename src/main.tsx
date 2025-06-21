
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Clear any existing React state and ensure clean mount
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element not found');
}

// Clear any existing content
rootElement.innerHTML = '';

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
