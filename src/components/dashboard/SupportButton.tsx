
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface SupportButtonProps {
  className?: string;
}

const SupportButton: React.FC<SupportButtonProps> = ({ className }) => {
  const [whatsappNumber, setWhatsappNumber] = React.useState('46999324779');
  const { toast } = useToast();
  
  React.useEffect(() => {
    const fetchWhatsappNumber = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('whatsapp_suporte')
            .eq('id', user.id)
            .single();
            
          if (profile && profile.whatsapp_suporte) {
            setWhatsappNumber(profile.whatsapp_suporte);
          }
        }
      } catch (error) {
        console.error('Error fetching WhatsApp support number:', error);
      }
    };
    
    fetchWhatsappNumber();
  }, []);
  
  const handleSupportClick = () => {
    // Format the WhatsApp number (remove any non-digit characters and add country code)
    const formattedNumber = `55${whatsappNumber.replace(/\D/g, '')}`;
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=Olá,%20preciso%20de%20suporte%20na%20plataforma%20Oficina%20Go.`;
    
    // Open in new window
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Contato de suporte",
      description: "Redirecionando para WhatsApp...",
    });
  };
  
  return (
    <Button 
      onClick={handleSupportClick} 
      className={`flex items-center gap-2 ${className}`}
      variant="outline"
    >
      <MessageCircle className="h-4 w-4" />
      Contatar Suporte
    </Button>
  );
};

export default SupportButton;
