
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart, LineChart } from "lucide-react";
import {
  ResponsiveContainer,
  Line as ReLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar as ReBar,
  BarChart as ReBarChart,
  LineChart as ReLineChart,
} from "recharts";
import React from "react";

const data = [
  { name: "Jan", serviços: 30, orçamentos: 45 },
  { name: "Fev", serviços: 22, orçamentos: 35 },
  { name: "Mar", serviços: 40, orçamentos: 50 },
  { name: "Abr", serviços: 28, orçamentos: 38 },
  { name: "Mai", serviços: 50, orçamentos: 65 },
];

export default function RelatoriosAvancadosPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📊 Relatórios Avançados</h1>
      <Tabs defaultValue="servicos" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="servicos">
            <LineChart className="w-4 h-4 mr-2" /> Serviços
          </TabsTrigger>
          <TabsTrigger value="orcamentos">
            <BarChart className="w-4 h-4 mr-2" /> Orçamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="servicos">
          <Card>
            <CardContent className="h-[300px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ReLineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <ReLine type="monotone" dataKey="serviços" stroke="#2563eb" strokeWidth={2} />
                </ReLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orcamentos">
          <Card>
            <CardContent className="h-[300px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <ReBar dataKey="orcamentos" fill="#22c55e" radius={[6, 6, 0, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

