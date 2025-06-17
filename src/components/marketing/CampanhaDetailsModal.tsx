
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Mail, MessageSquare, Users, FileText, Image, Video, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
}

interface Campanha {
  id: string;
  titulo: string;
  mensagem: string;
  tipo_envio: 'whatsapp' | 'email';
  data_agendada: string;
  status: 'agendado' | 'enviado' | 'falhou';
  clientes_ids: string[];
  arquivo_url?: string;
  tipo_arquivo?: 'imagem' | 'video';
  created_at: string;
}

interface CampanhaDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campanha: Campanha | null;
  clientes: Cliente[];
}

const CampanhaDetailsModal: React.FC<CampanhaDetailsModalProps> = ({
  isOpen,
  onClose,
  campanha,
  clientes
}) => {
  if (!campanha) return null;

  const getStatusBadge = (status: string) => {
    const variants = {
      'agendado': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'enviado': 'bg-green-100 text-green-800 border-green-300',
      'falhou': 'bg-red-100 text-red-800 border-red-300'
    };
    const icons = {
      'agendado': '⏳',
      'enviado': '✓',
      'falhou': '✗'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.agendado}>
        {icons[status as keyof typeof icons]} {status}
      </Badge>
    );
  };

  const getClientesNomes = (clientesIds: string[]) => {
    return clientesIds
      .map(id => clientes.find(c => c.id === id)?.nome)
      .filter(Boolean);
  };

  const clientesSelecionados = getClientesNomes(campanha.clientes_ids);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {campanha.tipo_envio === 'whatsapp' ? (
              <MessageSquare className="h-5 w-5 text-green-600" />
            ) : (
              <Mail className="h-5 w-5 text-blue-600" />
            )}
            {campanha.titulo}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status e Tipo */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Status:</span>
              {getStatusBadge(campanha.status)}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Tipo:</span>
              <Badge variant="outline" className="flex items-center gap-1">
                {campanha.tipo_envio === 'whatsapp' ? (
                  <MessageSquare className="h-3 w-3" />
                ) : (
                  <Mail className="h-3 w-3" />
                )}
                {campanha.tipo_envio === 'whatsapp' ? 'WhatsApp' : 'E-mail'}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Data Agendada
              </label>
              <p className="font-medium">
                {format(new Date(campanha.data_agendada), 'dd/MM/yyyy \'às\' HH:mm', { locale: ptBR })}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Data de Criação
              </label>
              <p className="font-medium">
                {format(new Date(campanha.created_at), 'dd/MM/yyyy \'às\' HH:mm', { locale: ptBR })}
              </p>
            </div>
          </div>

          <Separator />

          {/* Mensagem */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Mensagem
            </label>
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="whitespace-pre-wrap">{campanha.mensagem}</p>
            </div>
          </div>

          {/* Arquivo anexado */}
          {campanha.arquivo_url && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                {campanha.tipo_arquivo === 'imagem' ? (
                  <Image className="h-4 w-4" />
                ) : (
                  <Video className="h-4 w-4" />
                )}
                Arquivo Anexado
              </label>
              <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {campanha.tipo_arquivo === 'imagem' ? '📷' : '🎥'}
                  <span>{campanha.tipo_arquivo === 'imagem' ? 'Imagem' : 'Vídeo'} anexado</span>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={campanha.arquivo_url} target="_blank" rel="noopener noreferrer">
                    Visualizar
                  </a>
                </Button>
              </div>
            </div>
          )}

          <Separator />

          {/* Destinatários */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <Users className="h-4 w-4" />
              Destinatários ({clientesSelecionados.length})
            </label>
            <div className="border rounded-lg p-4 bg-gray-50 max-h-32 overflow-y-auto">
              {clientesSelecionados.length > 0 ? (
                <div className="space-y-1">
                  {clientesSelecionados.map((nome, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-sm">{nome}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Nenhum cliente selecionado</p>
              )}
            </div>
          </div>

          {/* Informações de envio */}
          {campanha.status === 'enviado' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 text-sm">
                <strong>✓ Campanha enviada com sucesso!</strong><br />
                Enviado para {clientesSelecionados.length} destinatário(s) via {campanha.tipo_envio === 'whatsapp' ? 'WhatsApp' : 'E-mail'}.
              </p>
            </div>
          )}

          {campanha.status === 'falhou' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">
                <strong>✗ Falha no envio da campanha</strong><br />
                Ocorreu um erro durante o envio. Verifique as configurações e tente novamente.
              </p>
            </div>
          )}

          {campanha.status === 'agendado' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-yellow-800 text-sm">
                <strong>⏳ Campanha agendada</strong><br />
                A campanha será enviada automaticamente na data e hora programadas.
              </p>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CampanhaDetailsModal;
