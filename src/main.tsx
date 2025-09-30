
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const handleRenderError = (error: Error) => {
  console.error('Render error:', error);
  
  // Special handling for Supabase errors
  if (error.message.includes('supabase')) {
    console.error('Supabase configuration error. Please check your environment variables.');
  }
  
  // Create error display
  const errorContainer = document.createElement('div');
  errorContainer.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #1a1a1a;
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-family: system-ui, -apple-system, sans-serif;
      z-index: 9999;
    ">
      <h1 style="font-size: 2rem; margin-bottom: 1rem;">Application Error</h1>
      <p style="margin-bottom: 1rem; text-align: center; max-width: 600px;">
        ${error.message}
      </p>
      <button 
        onclick="window.location.reload()" 
        style="
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 1rem;
        "
      >
        Reload Page
      </button>
    </div>
  `;
  
  document.body.appendChild(errorContainer);
};

try {
  createRoot(document.getElementById('root')!).render(
    <App />
  );
} catch (error) {
  handleRenderError(error as Error);
}
