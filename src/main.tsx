
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import App from './App.tsx';
import './index.css';

// Create error handler
const handleRenderError = (error: Error) => {
  console.error("Rendering error:", error);
  const rootElement = document.getElementById('root');
  
  // Special handling for Supabase errors
  const isSupabaseError = error.message.includes('supabase') || 
                          error.stack?.includes('supabase');
                          
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: system-ui, sans-serif;">
        <h2>Algo deu errado</h2>
        <p>${isSupabaseError 
          ? 'Não foi possível conectar ao Supabase. O aplicativo está rodando em modo de demonstração.' 
          : 'O aplicativo encontrou um problema. Por favor, recarregue a página.'}</p>
        ${isSupabaseError ? `
          <div style="max-width: 500px; margin: 20px auto; text-align: left; background: #f8f8f8; padding: 15px; border-radius: 8px;">
            <p><strong>Configuração do Supabase:</strong></p>
            <ol style="padding-left: 20px; line-height: 1.6;">
              <li>Clique no botão verde Supabase no canto superior direito desta interface.</li>
              <li>Conecte ao Supabase para ativar funcionalidades de backend.</li>
              <li>Uma vez conectado, este erro desaparecerá automaticamente.</li>
            </ol>
          </div>
        ` : ''}
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
