
import { supabase } from '@/lib/supabase';

export interface ExportData {
  orcamentos: any[];
  clientes: any[];
  servicos: any[];
}

export interface ExportOptions {
  startDate?: string;
  endDate?: string;
  format: 'xml' | 'excel' | 'csv';
  includeOrcamentos: boolean;
  includeClientes: boolean;
  includeServicos: boolean;
}

export const integracaoContabilService = {
  // Exportar dados
  async exportarDados(options: ExportOptions): Promise<Blob> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const exportData: ExportData = {
        orcamentos: [],
        clientes: [],
        servicos: []
      };

      // Buscar orçamentos
      if (options.includeOrcamentos) {
        let query = supabase
          .from('orcamentos')
          .select('*')
          .eq('user_id', user.id);

        if (options.startDate) {
          query = query.gte('created_at', options.startDate);
        }
        if (options.endDate) {
          query = query.lte('created_at', options.endDate);
        }

        const { data: orcamentos } = await query;
        exportData.orcamentos = orcamentos || [];
      }

      // Buscar clientes
      if (options.includeClientes) {
        const { data: clientes } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', user.id);
        exportData.clientes = clientes || [];
      }

      // Buscar serviços
      if (options.includeServicos) {
        const { data: servicos } = await supabase
          .from('services')
          .select('*')
          .eq('user_id', user.id);
        exportData.servicos = servicos || [];
      }

      // Gerar arquivo baseado no formato
      switch (options.format) {
        case 'xml':
          return this.gerarXML(exportData);
        case 'excel':
          return this.gerarExcel(exportData);
        case 'csv':
          return this.gerarCSV(exportData);
        default:
          throw new Error('Formato não suportado');
      }
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      throw error;
    }
  },

  // Gerar XML
  gerarXML(data: ExportData): Blob {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<exportacao>\n';
    
    // Orçamentos
    if (data.orcamentos.length > 0) {
      xml += '  <orcamentos>\n';
      data.orcamentos.forEach(orcamento => {
        xml += `    <orcamento>\n`;
        xml += `      <id>${orcamento.id}</id>\n`;
        xml += `      <cliente>${this.escapeXML(orcamento.cliente)}</cliente>\n`;
        xml += `      <veiculo>${this.escapeXML(orcamento.veiculo)}</veiculo>\n`;
        xml += `      <valor_total>${orcamento.valor_total}</valor_total>\n`;
        xml += `      <data_criacao>${orcamento.created_at}</data_criacao>\n`;
        xml += `      <status>${orcamento.status}</status>\n`;
        xml += `    </orcamento>\n`;
      });
      xml += '  </orcamentos>\n';
    }

    // Clientes
    if (data.clientes.length > 0) {
      xml += '  <clientes>\n';
      data.clientes.forEach(cliente => {
        xml += `    <cliente>\n`;
        xml += `      <id>${cliente.id}</id>\n`;
        xml += `      <nome>${this.escapeXML(cliente.nome)}</nome>\n`;
        xml += `      <telefone>${cliente.telefone}</telefone>\n`;
        xml += `      <email>${cliente.email || ''}</email>\n`;
        xml += `      <endereco>${this.escapeXML(cliente.endereco || '')}</endereco>\n`;
        xml += `    </cliente>\n`;
      });
      xml += '  </clientes>\n';
    }

    xml += '</exportacao>';
    
    return new Blob([xml], { type: 'application/xml' });
  },

  // Gerar Excel (CSV formatado)
  gerarExcel(data: ExportData): Blob {
    let csv = '';
    
    // Orçamentos
    if (data.orcamentos.length > 0) {
      csv += 'ORÇAMENTOS\n';
      csv += 'ID,Cliente,Veículo,Valor Total,Data Criação,Status\n';
      data.orcamentos.forEach(orcamento => {
        csv += `${orcamento.id},"${orcamento.cliente}","${orcamento.veiculo}",${orcamento.valor_total},${orcamento.created_at},${orcamento.status}\n`;
      });
      csv += '\n';
    }

    // Clientes
    if (data.clientes.length > 0) {
      csv += 'CLIENTES\n';
      csv += 'ID,Nome,Telefone,Email,Endereço\n';
      data.clientes.forEach(cliente => {
        csv += `${cliente.id},"${cliente.nome}","${cliente.telefone}","${cliente.email || ''}","${cliente.endereco || ''}"\n`;
      });
      csv += '\n';
    }

    return new Blob([csv], { type: 'application/vnd.ms-excel' });
  },

  // Gerar CSV
  gerarCSV(data: ExportData): Blob {
    return this.gerarExcel(data); // Mesmo formato do Excel
  },

  // Escapar caracteres especiais no XML
  escapeXML(text: string): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  // Importar dados de arquivo
  async importarDados(file: File): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const text = await file.text();
      
      if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx')) {
        await this.importarCSV(text, user.id);
      } else {
        throw new Error('Formato de arquivo não suportado');
      }
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      throw error;
    }
  },

  // Importar CSV
  async importarCSV(csvText: string, userId: string): Promise<void> {
    const lines = csvText.split('\n');
    const clientes = [];
    
    // Processa apenas clientes por simplicidade
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const columns = line.split(',').map(col => col.replace(/"/g, ''));
      if (columns.length >= 3) {
        clientes.push({
          nome: columns[1],
          telefone: columns[2],
          email: columns[3] || null,
          endereco: columns[4] || null,
          user_id: userId,
          veiculo: 'Importado'
        });
      }
    }

    if (clientes.length > 0) {
      const { error } = await supabase
        .from('clients')
        .insert(clientes);
        
      if (error) throw error;
    }
  },

  // Baixar arquivo
  downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
