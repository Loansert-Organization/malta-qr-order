
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure React is properly initialized before any component mounting
console.log('React initialization check:', {
  reactExists: typeof React !== 'undefined',
  useStateExists: typeof React.useState === 'function',
  version: React.version
});

// Clear any existing React state and ensure clean mount
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element not found');
}

// Clear any existing content
rootElement.innerHTML = '';

const root = createRoot(rootElement);

// Wrap everything in a try-catch to prevent React initialization issues
try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('React mounting error:', error);
  // Fallback rendering without StrictMode
  root.render(<App />);
}
