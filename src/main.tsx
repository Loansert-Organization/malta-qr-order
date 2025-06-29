
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupGlobalAIErrorHandling } from './utils/aiMonitor';

// Setup global AI error monitoring
setupGlobalAIErrorHandling();

// Enhanced error handling for initialization
try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const root = ReactDOM.createRoot(rootElement);
  
  root.render(<App />);
} catch (error) {
  console.error('Failed to initialize React application:', error);
  
  // Fallback error display
  const fallbackDiv = document.createElement('div');
  fallbackDiv.innerHTML = `
    <div style="
      display: flex; 
      justify-content: center; 
      align-items: center; 
      height: 100vh; 
      font-family: Arial, sans-serif;
      background-color: #f7fafc;
      color: #2d3748;
    ">
      <div style="text-align: center; padding: 2rem; border-radius: 8px; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h1 style="color: #e53e3e; margin-bottom: 1rem;">Application Failed to Load</h1>
        <p style="margin-bottom: 1rem;">There was an error starting the application.</p>
        <button onclick="window.location.reload()" style="
          background: #3182ce; 
          color: white; 
          border: none; 
          padding: 0.5rem 1rem; 
          border-radius: 4px; 
          cursor: pointer;
        ">
          Reload Page
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(fallbackDiv);
}
