
export const generateBudgetPDF = (budget: any) => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    throw new Error('Não foi possível abrir a janela de impressão. Verifique se o popup está bloqueado.');
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Orçamento - ${budget.numero || budget.id}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          line-height: 1.6;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #2563eb;
          margin: 0;
        }
        .section {
          margin-bottom: 25px;
        }
        .section h2 {
          background-color: #f8fafc;
          padding: 10px;
          border-left: 4px solid #2563eb;
          margin: 0 0 15px 0;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .info-item {
          margin-bottom: 10px;
        }
        .info-label {
          font-weight: bold;
          color: #374151;
        }
        .total {
          background-color: #f0f9ff;
          border: 2px solid #2563eb;
          padding: 15px;
          text-align: center;
          border-radius: 8px;
        }
        .total h3 {
          margin: 0;
          color: #2563eb;
          font-size: 1.5em;
        }
        .status {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 20px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status.pendente {
          background-color: #fef3c7;
          color: #92400e;
        }
        .status.aprovado {
          background-color: #dcfce7;
          color: #166534;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 0.9em;
        }
        @media print {
          body { margin: 0; }
          .header { page-break-after: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>ORÇAMENTO</h1>
        <p>Número: ${budget.numero || `#${budget.id.substring(0, 8)}`}</p>
        <p>Data: ${formatDate(budget.created_at || new Date().toISOString())}</p>
      </div>

      <div class="section">
        <h2>Informações do Cliente</h2>
        <div class="info-grid">
          <div>
            <div class="info-item">
              <span class="info-label">Nome:</span> ${budget.cliente}
            </div>
            <div class="info-item">
              <span class="info-label">Veículo:</span> ${budget.veiculo}
            </div>
          </div>
          <div>
            <div class="info-item">
              <span class="info-label">Status:</span> 
              <span class="status ${budget.status}">${budget.status}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Descrição dos Serviços</h2>
        <p>${budget.descricao || 'Nenhuma descrição fornecida.'}</p>
      </div>

      <div class="section">
        <div class="total">
          <h3>Valor Total: ${formatCurrency(budget.valor_total || 0)}</h3>
        </div>
      </div>

      <div class="footer">
        <p>Orçamento gerado em ${formatDate(new Date().toISOString())}</p>
        <p>Este orçamento é válido por 30 dias.</p>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  
  // Wait for content to load then print
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};

export const generateServiceOrderPDF = (ordem: any) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Não foi possível abrir a janela de impressão');
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aberto': return 'aberto';
      case 'Aprovado': return 'aprovado';
      case 'Em Andamento': return 'em-andamento';
      case 'Aguardando Peças': return 'aguardando';
      case 'Finalizado': return 'finalizado';
      case 'Cancelado': return 'cancelado';
      default: return 'default';
    }
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Ordem de Serviço #${ordem.id.substring(0, 8)}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #2563eb;
        }
        .header h1 {
          color: #2563eb;
          font-size: 2.5em;
          margin-bottom: 10px;
        }
        .header p {
          color: #6b7280;
          font-size: 1.1em;
        }
        .section {
          margin-bottom: 30px;
          padding: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }
        .section h2 {
          color: #374151;
          margin-bottom: 15px;
          font-size: 1.3em;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 5px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .info-item {
          margin-bottom: 10px;
        }
        .info-label {
          font-weight: bold;
          color: #374151;
        }
        .total {
          background-color: #f0f9ff;
          border: 2px solid #2563eb;
          padding: 15px;
          text-align: center;
          border-radius: 8px;
        }
        .total h3 {
          margin: 0;
          color: #2563eb;
          font-size: 1.5em;
        }
        .status {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 20px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status.aberto {
          background-color: #dbeafe;
          color: #1e40af;
        }
        .status.aprovado {
          background-color: #dcfce7;
          color: #166534;
        }
        .status.em-andamento {
          background-color: #fef3c7;
          color: #92400e;
        }
        .status.aguardando {
          background-color: #fed7aa;
          color: #c2410c;
        }
        .status.finalizado {
          background-color: #dcfce7;
          color: #166534;
        }
        .status.cancelado {
          background-color: #fecaca;
          color: #dc2626;
        }
        .status.default {
          background-color: #f3f4f6;
          color: #374151;
        }
        .services-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        .services-table th,
        .services-table td {
          border: 1px solid #e5e7eb;
          padding: 10px;
          text-align: left;
        }
        .services-table th {
          background-color: #f9fafb;
          font-weight: bold;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 0.9em;
        }
        @media print {
          body { margin: 0; }
          .header { page-break-after: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>ORDEM DE SERVIÇO</h1>
        <p>Número: #${ordem.id.substring(0, 8)}</p>
        <p>Data de Criação: ${formatDate(ordem.data_inicio || ordem.created_at)}</p>
      </div>

      <div class="section">
        <h2>Informações do Cliente</h2>
        <div class="info-grid">
          <div>
            <div class="info-item">
              <span class="info-label">Nome:</span> ${ordem.cliente_nome || 'N/A'}
            </div>
            <div class="info-item">
              <span class="info-label">Veículo:</span> ${ordem.veiculo_info || 'N/A'}
            </div>
          </div>
          <div>
            <div class="info-item">
              <span class="info-label">Status:</span> 
              <span class="status ${getStatusColor(ordem.status)}">${ordem.status}</span>
            </div>
            ${ordem.data_fim ? `
            <div class="info-item">
              <span class="info-label">Data de Conclusão:</span> ${formatDate(ordem.data_fim)}
            </div>
            ` : ''}
          </div>
        </div>
      </div>

      ${ordem.servicos && ordem.servicos.length > 0 ? `
      <div class="section">
        <h2>Serviços Realizados</h2>
        <table class="services-table">
          <thead>
            <tr>
              <th>Serviço</th>
              <th>Quantidade</th>
              <th>Valor Unitário</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${ordem.servicos.map((servico: any) => `
              <tr>
                <td>${servico.nome}</td>
                <td>${servico.quantidade}</td>
                <td>${formatCurrency(servico.valor)}</td>
                <td>${formatCurrency(servico.valor * servico.quantidade)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      ${ordem.observacoes ? `
      <div class="section">
        <h2>Observações</h2>
        <p>${ordem.observacoes}</p>
      </div>
      ` : ''}

      <div class="section">
        <div class="total">
          <h3>Valor Total: ${formatCurrency(ordem.valor_total || 0)}</h3>
        </div>
      </div>

      <div class="footer">
        <p>Ordem de Serviço gerada em ${formatDate(new Date().toISOString())}</p>
        <p>Documento válido para comprovação de serviços realizados.</p>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
