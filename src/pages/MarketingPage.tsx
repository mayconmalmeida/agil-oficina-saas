
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Mail, MessageSquare, Upload, Send, Eye, Trash2, Edit } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
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

const MarketingPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Estados do formulário
  const [titulo, setTitulo] = useState('');
  const [tipoEnvio, setTipoEnvio] = useState<'whatsapp' | 'email'>('whatsapp');
  const [dataAgendada, setDataAgendada] = useState('');
  const [horaAgendada, setHoraAgendada] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [clientesSelecionados, setClientesSelecionados] = useState<string[]>([]);
  const [arquivo, setArquivo] = useState<File | null>(null);

  // Carregar clientes e campanhas
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      // Carregar clientes
      const { data: clientesData, error: clientesError } = await supabase
        .from('clients')
        .select('id, nome, email, telefone')
        .eq('is_active', true)
        .order('nome');

      if (clientesError) throw clientesError;
      setClientes(clientesData || []);

      // Carregar campanhas
      const { data: campanhasData, error: campanhasError } = await supabase
        .from('campanhas_marketing')
        .select('*')
        .order('created_at', { ascending: false });

      if (campanhasError) throw campanhasError;
      
      // Converter os dados do banco para o tipo correto
      const campanhasTyped: Campanha[] = (campanhasData || []).map(campanha => ({
        ...campanha,
        tipo_envio: campanha.tipo_envio as 'whatsapp' | 'email',
        status: campanha.status as 'agendado' | 'enviado' | 'falhou',
        tipo_arquivo: campanha.tipo_arquivo as 'imagem' | 'video' | undefined,
        clientes_ids: campanha.clientes_ids || [],
        arquivo_url: campanha.arquivo_url || undefined,
        created_at: campanha.created_at || new Date().toISOString()
      }));
      
      setCampanhas(campanhasTyped);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message
      });
    }
  };

  const handleFileUpload = async (file: File): Promise<string | null> => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('campanhas')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('campanhas')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Erro no upload:', error);
      return null;
    }
  };

  const criarCampanha = async () => {
    if (!titulo || !mensagem || !dataAgendada || !horaAgendada || clientesSelecionados.length === 0) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios e selecione pelo menos um cliente"
      });
      return;
    }

    setLoading(true);
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      let arquivoUrl = null;
      let tipoArquivo = null;

      // Upload do arquivo se houver
      if (arquivo) {
        arquivoUrl = await handleFileUpload(arquivo);
        tipoArquivo = arquivo.type.startsWith('image/') ? 'imagem' : 'video';
      }

      const dataHoraCompleta = new Date(`${dataAgendada}T${horaAgendada}`).toISOString();

      const { error } = await supabase
        .from('campanhas_marketing')
        .insert({
          user_id: userId,
          titulo,
          mensagem,
          tipo_envio: tipoEnvio,
          data_agendada: dataHoraCompleta,
          clientes_ids: clientesSelecionados,
          arquivo_url: arquivoUrl,
          tipo_arquivo: tipoArquivo
        });

      if (error) throw error;

      // Simular processamento/envio da campanha
      await processarEnvioCampanha(titulo, tipoEnvio, clientesSelecionados);

      toast({
        title: "Sucesso",
        description: "Campanha criada e processada com sucesso!"
      });

      // Limpar formulário
      setTitulo('');
      setMensagem('');
      setDataAgendada('');
      setHoraAgendada('');
      setClientesSelecionados([]);
      setArquivo(null);

      // Recarregar campanhas
      carregarDados();

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const processarEnvioCampanha = async (titulo: string, tipo: 'whatsapp' | 'email', clientesIds: string[]) => {
    // Simular processamento de envio
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`Processando campanha: ${titulo}`);
    console.log(`Tipo de envio: ${tipo}`);
    console.log(`Clientes selecionados: ${clientesIds.length}`);
    
    // Aqui seria implementada a lógica real de envio
    // Para WhatsApp: integração com API do WhatsApp Business
    // Para Email: integração com serviço de email (SendGrid, etc)
  };

  const excluirCampanha = async (id: string) => {
    try {
      const { error } = await supabase
        .from('campanhas_marketing')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Campanha excluída com sucesso!"
      });

      carregarDados();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message
      });
    }
  };

  const visualizarCampanha = (campanha: Campanha) => {
    toast({
      title: "Visualizar Campanha",
      description: `Abrindo detalhes da campanha: ${campanha.titulo}`,
    });
  };

  const toggleClienteSelecionado = (clienteId: string) => {
    setClientesSelecionados(prev => 
      prev.includes(clienteId) 
        ? prev.filter(id => id !== clienteId)
        : [...prev, clienteId]
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'agendado': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'enviado': 'bg-green-100 text-green-800 border-green-300',
      'falhou': 'bg-red-100 text-red-800 border-red-300'
    };
    return variants[status as keyof typeof variants] || variants.agendado;
  };

  const getClientesNomes = (clientesIds: string[]) => {
    return clientesIds
      .map(id => clientes.find(c => c.id === id)?.nome)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Marketing Integrado
              </h1>
              <p className="text-gray-600 mt-2">
                Crie e gerencie campanhas de WhatsApp e e-mail para seus clientes.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Criar nova campanha */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Nova Campanha</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Título da Campanha</label>
                  <Input 
                    placeholder="Ex: Promoção de Verão 2024"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de Envio</label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant={tipoEnvio === 'whatsapp' ? 'default' : 'outline'} 
                      className="flex flex-col items-center p-4 h-auto"
                      onClick={() => setTipoEnvio('whatsapp')}
                    >
                      <MessageSquare className="h-6 w-6 mb-2" />
                      WhatsApp
                    </Button>
                    <Button 
                      variant={tipoEnvio === 'email' ? 'default' : 'outline'} 
                      className="flex flex-col items-center p-4 h-auto"
                      onClick={() => setTipoEnvio('email')}
                    >
                      <Mail className="h-6 w-6 mb-2" />
                      E-mail
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Data do Envio</label>
                    <Input 
                      type="date"
                      value={dataAgendada}
                      onChange={(e) => setDataAgendada(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Hora do Envio</label>
                    <Input 
                      type="time"
                      value={horaAgendada}
                      onChange={(e) => setHoraAgendada(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mensagem ({mensagem.length}/500 caracteres)
                  </label>
                  <Textarea 
                    placeholder="Digite o conteúdo da sua campanha..."
                    rows={4}
                    maxLength={500}
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Arquivo (Opcional)</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                    />
                    {arquivo && (
                      <Badge variant="outline">
                        {arquivo.type.startsWith('image/') ? 'Imagem' : 'Vídeo'}
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Clientes ({clientesSelecionados.length} selecionados)
                  </label>
                  <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                    {clientes.map(cliente => (
                      <div key={cliente.id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={clientesSelecionados.includes(cliente.id)}
                          onCheckedChange={() => toggleClienteSelecionado(cliente.id)}
                        />
                        <span className="text-sm">{cliente.nome}</span>
                        <span className="text-xs text-gray-500">
                          {tipoEnvio === 'whatsapp' ? cliente.telefone : cliente.email}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={criarCampanha} disabled={loading}>
                    <Send className="h-4 w-4 mr-2" />
                    {loading ? 'Criando...' : 'Agendar Envio'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Campanhas recentes */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Campanhas Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campanhas.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      Nenhuma campanha criada ainda
                    </p>
                  ) : (
                    campanhas.slice(0, 5).map((campanha) => (
                      <div key={campanha.id} className="border rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{campanha.titulo}</h4>
                          <Badge className={getStatusBadge(campanha.status)}>
                            {campanha.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          {campanha.tipo_envio === 'whatsapp' ? (
                            <MessageSquare className="h-4 w-4" />
                          ) : (
                            <Mail className="h-4 w-4" />
                          )}
                          <span className="text-xs text-gray-600">
                            {format(new Date(campanha.data_agendada), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          Para: {getClientesNomes(campanha.clientes_ids)}
                        </p>
                        {campanha.arquivo_url && (
                          <Badge variant="outline" className="text-xs mb-2">
                            {campanha.tipo_arquivo === 'imagem' ? '📷' : '🎥'} Mídia anexada
                          </Badge>
                        )}
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs"
                            onClick={() => visualizarCampanha(campanha)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs"
                            onClick={() => excluirCampanha(campanha.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingPage;
