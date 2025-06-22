
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure React is available globally to prevent null reference errors
if (typeof window !== 'undefined') {
  (window as any).React = React;
}

// Defensive check to ensure React and its hooks are available
if (!React || typeof React.useState !== 'function') {
  throw new Error('React is not properly loaded. Please check your imports and dependencies.');
}

console.log('React initialization check:', {
  reactExists: typeof React !== 'undefined',
  useStateExists: typeof React.useState === 'function',
  version: React.version
});

// Ensure clean DOM mount
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element not found');
}

// Clear any existing content and create fresh root
rootElement.innerHTML = '';
const root = createRoot(rootElement);

// Mount with error boundary
try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('React mounting error:', error);
  // Fallback without StrictMode if there are issues
  try {
    root.render(<App />);
  } catch (fallbackError) {
    console.error('Fallback rendering failed:', fallbackError);
    rootElement.innerHTML = '<div style="padding: 20px; color: red;">Application failed to load. Please refresh the page.</div>';
  }
}
