import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Auth from '@/pages/Auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardPage from '@/pages/DashboardPage';
import ClientsPage from '@/pages/ClientsPage';
import ServicesPage from '@/pages/ServicesPage';
import BudgetsPage from '@/pages/BudgetsPage';
import SchedulingPage from '@/pages/SchedulingPage';
import SettingsPage from '@/pages/SettingsPage';
import NewClientPage from '@/pages/NewClientPage';
import EditClientPage from '@/pages/EditClientPage';
import NewServicePage from '@/pages/NewServicePage';
import EditServicePage from '@/pages/EditServicePage';
import NewBudgetPage from '@/pages/NewBudgetPage';
import EditBudgetPage from '@/pages/EditBudgetPage';
import NewSchedulePage from '@/pages/NewSchedulePage';
import AgendamentosPage from '@/pages/AgendamentosPage';
import OrdemServicoPage from '@/pages/OrdemServicoPage';
import FornecedoresPage from '@/pages/FornecedoresPage';
import NewFornecedorPage from '@/pages/NewFornecedorPage';
import EditFornecedorPage from '@/pages/EditFornecedorPage';
import ProdutosPage from '@/pages/ProdutosPage';
import NewProdutoPage from '@/pages/NewProdutoPage';
import EditProdutoPage from '@/pages/EditProdutoPage';
import CategoriasPage from '@/pages/CategoriasPage';
import NewCategoriaPage from '@/pages/NewCategoriaPage';
import EditCategoriaPage from '@/pages/EditCategoriaPage';
import EmpresaPage from '@/pages/EmpresaPage';
import AssinaturaPage from '@/pages/AssinaturaPage';
import SuportePage from '@/pages/SuportePage';
import IntegracaoContabilPage from '@/pages/IntegracaoContabilPage';
import ConfiguracoesPage from '@/pages/ConfiguracoesPage';
import RelatoriosPage from '@/pages/RelatoriosPage';
import VeiculosPage from '@/pages/VeiculosPage';
import NewVeiculoPage from '@/pages/NewVeiculoPage';
import EditVeiculoPage from '@/pages/EditVeiculoPage';
import IADiagnosticoPage from '@/pages/IADiagnosticoPage';
import IASuporteInteligentePage from '@/pages/IASuporteInteligentePage';
import RelatoriosAvancadosPage from '@/pages/RelatoriosAvancadosPage';
import BackupPage from '@/pages/BackupPage';
import OrdemServicoDetalhePage from '@/pages/OrdemServicoDetalhePage';
import FinanceiroPage from '@/pages/FinanceiroPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/auth" element={<Auth />} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="clientes" element={<ClientsPage />} />
            <Route path="clientes/novo" element={<NewClientPage />} />
            <Route path="clientes/:id/editar" element={<EditClientPage />} />
          <Route path="veiculos" element={<VeiculosPage />} />
            <Route path="veiculos/novo" element={<NewVeiculoPage />} />
            <Route path="veiculos/:id/editar" element={<EditVeiculoPage />} />
          <Route path="servicos" element={<ServicesPage />} />
            <Route path="servicos/novo" element={<NewServicePage />} />
            <Route path="servicos/:id/editar" element={<EditServicePage />} />
          <Route path="orcamentos" element={<BudgetsPage />} />
            <Route path="orcamentos/novo" element={<NewBudgetPage />} />
            <Route path="orcamentos/:id/editar" element={<EditBudgetPage />} />
          <Route path="agendamentos" element={<AgendamentosPage />} />
            <Route path="agendamentos/novo" element={<NewSchedulePage />} />
          <Route path="ordem-servico" element={<OrdemServicoPage />} />
          <Route path="fornecedores" element={<FornecedoresPage />} />
            <Route path="fornecedores/novo" element={<NewFornecedorPage />} />
            <Route path="fornecedores/:id/editar" element={<EditFornecedorPage />} />
          <Route path="produtos" element={<ProdutosPage />} />
            <Route path="produtos/novo" element={<NewProdutoPage />} />
            <Route path="produtos/:id/editar" element={<EditProdutoPage />} />
          <Route path="categorias" element={<CategoriasPage />} />
            <Route path="categorias/novo" element={<NewCategoriaPage />} />
            <Route path="categorias/:id/editar" element={<EditCategoriaPage />} />
          <Route path="empresa" element={<EmpresaPage />} />
          <Route path="assinatura" element={<AssinaturaPage />} />
          <Route path="suporte" element={<SuportePage />} />
          <Route path="integracao-contabil" element={<IntegracaoContabilPage />} />
          <Route path="configuracoes" element={<ConfiguracoesPage />} />
          <Route path="relatorios" element={<RelatoriosPage />} />
          <Route path="relatorios-avancados" element={<RelatoriosAvancadosPage />} />
          <Route path="ia-diagnostico" element={<IADiagnosticoPage />} />
          <Route path="ia-suporte-inteligente" element={<IASuporteInteligentePage />} />
          <Route path="backup" element={<BackupPage />} />
          <Route path="ordem-servico/:id" element={<OrdemServicoDetalhePage />} />
          <Route path="financeiro" element={<FinanceiroPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
