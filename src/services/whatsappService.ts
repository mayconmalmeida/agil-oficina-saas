// Serviço para integração com WhatsApp
// Em produção, isso seria integrado com a API oficial do WhatsApp Business

interface WhatsAppMessage {
  to: string;
  message: string;
  from?: string;
}

export const sendWhatsAppMessage = async (data: WhatsAppMessage): Promise<boolean> => {
  try {
    // Para demonstração, vamos apenas abrir o WhatsApp Web
    // Em produção, isso seria uma chamada para a API do WhatsApp Business
    
    const phoneNumber = data.to.replace(/\D/g, ''); // Remove caracteres não numéricos
    const message = encodeURIComponent(data.message);
    
    // Formato internacional brasileiro (+55)
    const formattedNumber = phoneNumber.startsWith('55') ? phoneNumber : `55${phoneNumber}`;
    
    // Abre WhatsApp Web com a mensagem pré-preenchida
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${message}`;
    
    // Abre em nova aba
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    
    return true;
  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error);
    return false;
  }
};

export const initializeWhatsAppChat = async (supportNumber: string, message: string): Promise<boolean> => {
  try {
    const phoneNumber = supportNumber.replace(/\D/g, '');
    const formattedNumber = phoneNumber.startsWith('55') ? phoneNumber : `55${phoneNumber}`;
    const encodedMessage = encodeURIComponent(message);
    
    // Detectar se está em dispositivo móvel
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Em dispositivos móveis, tentar app do WhatsApp primeiro
      const whatsappAppUrl = `whatsapp://send?phone=${formattedNumber}&text=${encodedMessage}`;
      window.location.href = whatsappAppUrl;
      
      // Fallback para WhatsApp Web após 2 segundos caso o app não abra
      setTimeout(() => {
        const whatsappWebUrl = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
        window.open(whatsappWebUrl, '_blank', 'noopener,noreferrer');
      }, 2000);
    } else {
      // Em desktop, abrir WhatsApp Web diretamente
      const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao inicializar chat WhatsApp:', error);
    return false;
  }
};

// Em produção, estas funções seriam integradas com:
// 1. WhatsApp Business API
// 2. Twilio WhatsApp API
// 3. Ou outro provedor de mensagens WhatsApp
