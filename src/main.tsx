
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import App from './App.tsx';
import './index.css';

// Create error handler
const handleRenderError = (error: Error) => {
  console.error("Rendering error:", error);
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h2>Algo deu errado</h2>
        <p>O aplicativo encontrou um problema. Por favor, recarregue a página.</p>
        <button onclick="window.location.reload()" style="padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">
          Recarregar
        </button>
        <p style="margin-top: 10px; font-size: 12px; color: #666;">
          Erro: ${error.message}
        </p>
      </div>
    `;
  }
};

// Log environment variables (without exposing sensitive data)
console.log("Environment variables loaded:", {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? "Defined" : "Undefined",
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? "Defined (value hidden)" : "Undefined"
});

try {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (error) {
  handleRenderError(error as Error);
}
