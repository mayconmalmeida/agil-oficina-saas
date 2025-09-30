
import React, { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useCampanhaScheduler = () => {
  const { toast } = useToast();

  const processarCampanhasAgendadas = async () => {
    try {
      const agora = new Date().toISOString();
      
      // Buscar campanhas agendadas que já passaram do horário
      const { data: campanhasVencidas, error } = await supabase
        .from('campanhas_marketing')
        .select('*')
        .eq('status', 'agendado')
        .lte('data_agendada', agora);

      if (error) {
        console.error('Erro ao buscar campanhas:', error);
        return;
      }

      if (!campanhasVencidas || campanhasVencidas.length === 0) {
        return;
      }

      // Processar cada campanha vencida
      for (const campanha of campanhasVencidas) {
        try {
          // Simular envio da campanha
          console.log(`Enviando campanha: ${campanha.titulo}`);
          console.log(`Tipo: ${campanha.tipo_envio}`);
          console.log(`Destinatários: ${campanha.clientes_ids?.length || 0}`);
          
          // Simular delay de processamento
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Atualizar status para enviado
          const { error: updateError } = await supabase
            .from('campanhas_marketing')
            .update({ 
              status: 'enviado'
            })
            .eq('id', campanha.id);

          if (updateError) {
            console.error('Erro ao atualizar campanha:', updateError);
            
            // Marcar como erro se falhou
            await supabase
              .from('campanhas_marketing')
              .update({ status: 'falhou' })
              .eq('id', campanha.id);
          } else {
            toast({
              title: "Campanha enviada!",
              description: `"${campanha.titulo}" foi enviada via ${campanha.tipo_envio === 'whatsapp' ? 'WhatsApp' : 'E-mail'} para ${campanha.clientes_ids?.length || 0} destinatário(s)`,
            });
          }
        } catch (error) {
          console.error(`Erro ao processar campanha ${campanha.id}:`, error);
          
          // Marcar campanha como erro
          await supabase
            .from('campanhas_marketing')
            .update({ status: 'falhou' })
            .eq('id', campanha.id);
        }
      }
    } catch (error) {
      console.error('Erro geral no processamento de campanhas:', error);
    }
  };

  useEffect(() => {
    // Verificar campanhas imediatamente
    processarCampanhasAgendadas();

    // Configurar verificação a cada 30 segundos
    const interval = setInterval(processarCampanhasAgendadas, 30000);

    return () => clearInterval(interval);
  }, []);

  return { processarCampanhasAgendadas };
};
