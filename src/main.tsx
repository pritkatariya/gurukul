const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

console.log = (...args) => {
  const msg = args[0]?.toString?.() ?? '';
  if (msg.includes('[vite]') || msg.includes('Download the React DevTools')) return;
  originalLog.apply(console, args);
};

console.warn = (...args) => {
  const msg = args[0]?.toString?.() ?? '';
  if (msg.includes('[Violation]') || msg.includes('[vite]')) return;
  originalWarn.apply(console, args);
};

console.error = (...args) => {
  originalError.apply(console, args); // errors બધા આવશે
};

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)