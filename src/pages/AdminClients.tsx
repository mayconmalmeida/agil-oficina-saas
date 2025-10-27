import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, RefreshCw, Phone, MapPin, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ClientRow {
  id: string;
  nome: string | null;
  endereco: string | null;
  telefone: string | null; // WhatsApp/telefone
  oficina_id: string | null;
  user_id: string | null;
}

interface OficinaRow {
  id: string;
  nome_oficina: string | null;
}

const AdminClients: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [oficinaMap, setOficinaMap] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, nome, endereco, telefone, oficina_id, user_id')
        .order('created_at', { ascending: false });

      if (clientsError) throw clientsError;

      const list = (clientsData || []) as ClientRow[];
      setClients(list);

      const oficinaIds = Array.from(new Set(list.map(c => c.oficina_id).filter(Boolean))) as string[];
      let oficinaLookup: Record<string, string> = {};

      if (oficinaIds.length > 0) {
        const { data: oficinasData, error: oficinasError } = await supabase
          .from('oficinas')
          .select('id, nome_oficina')
          .in('id', oficinaIds);
        if (oficinasError) throw oficinasError;
        (oficinasData as OficinaRow[] || []).forEach(o => {
          if (o.id) oficinaLookup[o.id] = o.nome_oficina || '';
        });
      }

      // Fallback: tentar mapear via profiles usando user_id
      const missingOficinaIds = list
        .filter(c => !c.oficina_id && c.user_id)
        .map(c => c.user_id!)
        .filter(Boolean);
      if (missingOficinaIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, nome_oficina')
          .in('id', Array.from(new Set(missingOficinaIds)));
        if (!profilesError && profilesData) {
          (profilesData as { id: string; nome_oficina: string | null }[]).forEach(p => {
            oficinaLookup[p.id] = p.nome_oficina || '';
          });
        }
      }

      setOficinaMap(oficinaLookup);
    } catch (err: any) {
      console.error('Erro ao carregar clientes:', err);
      setError(err?.message || 'Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredClients = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter(c =>
      (c.nome || '').toLowerCase().includes(term) ||
      (c.endereco || '').toLowerCase().includes(term) ||
      (c.telefone || '').toLowerCase().includes(term) ||
      (oficinaMap[c.oficina_id || ''] || '').toLowerCase().includes(term)
    );
  }, [searchTerm, clients, oficinaMap]);

  const formatWhatsAppLink = (phone?: string | null) => {
    const digits = (phone || '').replace(/\D/g, '');
    if (!digits) return null;
    return `https://wa.me/${digits}`;
  };

  const handleBack = () => navigate('/admin');

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Clientes</h1>
            <p className="text-gray-600">Lista de clientes registrados, com endereço, WhatsApp e oficina</p>
          </div>
        </div>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Total de Clientes</div>
          <div className="text-2xl font-bold text-gray-900">{clients.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Com WhatsApp informado</div>
          <div className="text-2xl font-bold text-green-600">{clients.filter(c => !!c.telefone).length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Com Oficina vinculada</div>
          <div className="text-2xl font-bold text-purple-600">{clients.filter(c => !!c.oficina_id || !!c.user_id).length}</div>
        </div>
      </div>

      {/* Busca */}
      <div className="mb-4">
        <Input
          placeholder="Pesquisar por nome, endereço, WhatsApp ou oficina..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Oficina</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Carregando clientes...</TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-red-600">{error}</TableCell>
              </TableRow>
            ) : filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Nenhum cliente encontrado</TableCell>
              </TableRow>
            ) : (
              filteredClients.map((c) => {
                const wa = formatWhatsAppLink(c.telefone);
                const oficinaNome = c.oficina_id ? (oficinaMap[c.oficina_id] || '—') : (c.user_id ? (oficinaMap[c.user_id] || '—') : '—');
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nome || '—'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="h-4 w-4" />
                        <span>{c.endereco || '—'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {wa ? (
                        <a href={wa} target="_blank" rel="noreferrer" className="text-green-600 hover:underline inline-flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {c.telefone}
                        </a>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex items-center gap-2 text-gray-700">
                        <Users className="h-4 w-4" />
                        <span>{oficinaNome || '—'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => {}} disabled>
                        Em breve
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminClients;