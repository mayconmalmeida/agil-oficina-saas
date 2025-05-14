
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Log environment variables (without exposing sensitive data)
console.log("Environment variables loaded:", {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? "Defined" : "Undefined",
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? "Defined (value hidden)" : "Undefined"
});

createRoot(document.getElementById("root")!).render(<App />);
