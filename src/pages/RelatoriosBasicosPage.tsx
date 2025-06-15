
import React from "react";
import { useRelatoriosBasicosData } from "@/hooks/useRelatoriosBasicosData";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Users, ClipboardList, Coins } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, Legend } from "recharts";
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from "@/components/ui/table";
import { formatCurrency } from "@/utils/supabaseTypes";

// Bloqueia rota para users comuns/role "oficina"
import { useUserProfile } from "@/hooks/useUserProfile";
import { Navigate } from "react-router-dom";

const bgIcon = "rounded-full bg-gray-50 p-2 border border-gray-100 shadow-sm";

function RelatoriosBasicosPage() {
  const { data, loading } = useRelatoriosBasicosData();
  const { userProfile } = useUserProfile();

  // Não precisa de role, só verifica se o perfil existe (ou use o campo correto se quiser)
  if (!userProfile) {
    // Redireciona se não autenticado
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Relatórios Básicos</h1>
      <p className="text-muted-foreground mb-6">Tenha uma visão rápida dos principais números do seu dia a dia.</p>

      {/* Métricas principais (cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <Card>
          <CardContent className="flex flex-col items-start gap-2 p-4">
            <span className={bgIcon}><ClipboardList className="h-6 w-6 text-blue-800" /></span>
            <span className="text-xs text-muted-foreground">Orçamentos Criados</span>
            <span className="text-2xl font-bold">{loading ? "..." : data?.totalOrcamentos ?? 0}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-start gap-2 p-4">
            <span className={bgIcon}><BarChart3 className="h-6 w-6 text-orange-700" /></span>
            <span className="text-xs text-muted-foreground">Serviços Executados</span>
            <span className="text-2xl font-bold">{loading ? "..." : data?.totalServicos ?? 0}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-start gap-2 p-4">
            <span className={bgIcon}><Users className="h-6 w-6 text-green-700" /></span>
            <span className="text-xs text-muted-foreground">Clientes Cadastrados</span>
            <span className="text-2xl font-bold">{loading ? "..." : data?.totalClientes ?? 0}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-start gap-2 p-4">
            <span className={bgIcon}><Coins className="h-6 w-6 text-yellow-600" /></span>
            <span className="text-xs text-muted-foreground">Faturamento Total</span>
            <span className="text-2xl font-bold">
              {loading ? "..." : formatCurrency(data?.faturamentoTotal ?? 0)}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Barras: Orçamentos e Serviços por mês */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="h-5 w-5 text-blue-800" />
          <span className="font-semibold">Orçamentos e Serviços por mês</span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data?.graficoMensal ?? []} margin={{ left: 0, right: 10 }}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="orcamentos" fill="#2563eb" name="Orçamentos" />
            <Bar dataKey="servicos" fill="#ea580c" name="Serviços" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Linha - Faturamento */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border">
        <div className="flex items-center gap-3 mb-4">
          <Coins className="h-5 w-5 text-yellow-600" />
          <span className="font-semibold">Evolução do Faturamento (últimos 6 meses)</span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data?.graficoMensal ?? []}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
            <Legend />
            <Line type="monotone" dataKey="faturamento" stroke="#facc15" strokeWidth={2} name="Faturamento (R$)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Últimos 10 serviços realizados */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="h-5 w-5 text-orange-700" />
          <span className="font-semibold">Últimos 10 serviços realizados</span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4}>Carregando...</TableCell>
                </TableRow>
              ) : data?.ultimosServicos && data.ultimosServicos.length > 0 ? (
                data.ultimosServicos.map(s => (
                  <TableRow key={s.id}>
                    <TableCell>{s.cliente_nome}</TableCell>
                    <TableCell>{formatCurrency(s.valor_total)}</TableCell>
                    <TableCell>{s.status}</TableCell>
                    <TableCell>{new Date(s.created_at).toLocaleDateString("pt-BR")}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4}>Nenhum serviço encontrado.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default RelatoriosBasicosPage;
