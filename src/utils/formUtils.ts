
/**
 * Funções utilitárias de sanitização e validação para formulários.
 */

// Remove espaços extras e caracteres não numéricos de telefone
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, '').trim();
}

// Sanitiza email para minúsculo e trim
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Exemplo: Validação simples de e-mail
export function validateEmail(email: string): boolean {
  // Regex simples para e-mail válido
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Sanitiza nome tirando espaços extras
export function sanitizeName(name: string): string {
  return name.replace(/\s{2,}/g, ' ').trim();
}

// Sanitiza texto removendo caracteres não permitidos (exemplo simplificado)
export function sanitizeText(text: string): string {
  return text.replace(/[<>]/g, '').trim();
}
