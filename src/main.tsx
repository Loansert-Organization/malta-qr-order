
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import './index.css'

const root = createRoot(document.getElementById("root")!);

root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
