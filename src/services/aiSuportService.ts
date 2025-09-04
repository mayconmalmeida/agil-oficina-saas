export const generateSmartBotResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase();
  
  // Saudações
  if (message.includes('oi') || message.includes('olá') || message.includes('bom dia') || message.includes('boa tarde') || message.includes('boa noite')) {
    return "Olá! Sou o assistente virtual da Oficina Go. Como posso ajudar você hoje? 😊";
  }

  // Como cadastrar um produto
  if (message.includes('cadastrar produto') || message.includes('adicionar produto') || message.includes('novo produto')) {
    return `## 📦 Como Cadastrar um Produto

### Passo a Passo:

**1️⃣ Navegação**
• Acesse o menu "**Produtos**" no painel lateral
• Clique no botão "**+ Novo Produto**"

**2️⃣ Informações Básicas**
• **Nome do produto:** Digite o nome completo
• **Código:** Adicione um código único (opcional, mas recomendado)
• **Tipo:** Selecione "Produto" ou "Serviço"

**3️⃣ Valores e Estoque**
• **Valor de venda:** Preço final para o cliente
• **Preço de custo:** Quanto você pagou pelo produto
• **Quantidade em estoque:** Quantidade atual disponível
• **Estoque mínimo:** Alerta quando acabar

**4️⃣ Finalizar**
• Clique em "**Salvar**" para confirmar

---
💡 **Dica:** Use códigos únicos para facilitar buscas!
⚠️ **Importante:** Configure o estoque mínimo para receber alertas`;
  }

  // Como cadastrar um cliente
  if (message.includes('cadastrar cliente') || message.includes('adicionar cliente') || message.includes('novo cliente')) {
    return `## 👤 Como Cadastrar um Cliente

### Passo a Passo:

**1️⃣ Acessar Menu**
• Vá em "**Clientes**" no menu lateral
• Clique em "**+ Novo Cliente**"

**2️⃣ Dados Pessoais**
• **Nome completo:** Nome do cliente
• **Telefone:** Para contato
• **E-mail:** Email válido  
• **Tipo:** Pessoa Física ou Jurídica
• **Endereço:** Endereço completo

**3️⃣ Dados do Veículo** *(Nova Aba)*
• **Marca:** Toyota, Ford, etc.
• **Modelo:** Corolla, Ka, etc.
• **Ano:** Ano de fabricação
• **Placa:** ABC-1234
• **Cor:** Cor do veículo
• **Kilometragem:** Km atual

**4️⃣ Salvar**
• Clique em "**Salvar**" para finalizar

---
✅ **Resultado:** Cliente disponível para agendamentos e ordens de serviço!
🚗 **Dica:** Cadastre múltiplos veículos na aba específica`;
  }

  // Como criar um orçamento
  if (message.includes('orçamento') || message.includes('orcamento') || message.includes('fazer orçamento')) {
    return `Para criar um orçamento no sistema:

1️⃣ Vá em "Orçamentos" no menu
2️⃣ Clique em "Novo Orçamento"
3️⃣ Selecione o cliente e veículo
4️⃣ Adicione os serviços e produtos:
   • Busque por nome ou código
   • Defina quantidades
   • Valores são calculados automaticamente
5️⃣ Adicione observações se necessário
6️⃣ Clique em "Salvar"

📊 O orçamento pode ser enviado ao cliente e, se aprovado, transformado em Ordem de Serviço!`;
  }

  // Como criar ordem de serviço
  if (message.includes('ordem de serviço') || message.includes('ordem serviço') || message.includes('os')) {
    return `Para criar uma Ordem de Serviço:

1️⃣ Acesse "Ordens de Serviço"
2️⃣ Clique em "Nova Ordem"
3️⃣ Selecione cliente e veículo
4️⃣ Adicione serviços e produtos necessários
5️⃣ Defina o status (Aberta, Em Andamento, Concluída)
6️⃣ Adicione observações técnicas
7️⃣ Salve a ordem

🔄 Você também pode criar uma OS a partir de um orçamento aprovado!`;
  }

  // Como gerenciar estoque
  if (message.includes('estoque') || message.includes('controle de estoque')) {
    return `Para gerenciar o estoque:

📦 **Visualizar Estoque:**
• Acesse "Produtos" para ver quantidades
• Produtos com estoque baixo aparecem destacados

📥 **Entrada de Produtos:**
• Edite o produto e ajuste a quantidade
• Use "Notas Fiscais" para importar via XML

📤 **Saída Automática:**
• Ao finalizar uma OS, o estoque é baixado automaticamente
• Histórico de movimentações é mantido

⚠️ **Alertas:**
• Configure estoque mínimo para receber avisos
• Sistema alerta quando produtos estão acabando`;
  }

  // Como importar nota fiscal
  if (message.includes('nota fiscal') || message.includes('xml') || message.includes('importar')) {
    return `Para importar Nota Fiscal (XML):

1️⃣ Acesse "Notas Fiscais"
2️⃣ Clique em "Importar XML"
3️⃣ Selecione o arquivo XML da nota
4️⃣ O sistema irá:
   • Ler os produtos automaticamente
   • Criar novos produtos se não existirem
   • Atualizar estoque dos produtos existentes
5️⃣ Confirme a importação

💾 Todos os produtos da nota são adicionados ao seu estoque automaticamente!`;
  }

  // Como fazer backup
  if (message.includes('backup') || message.includes('exportar dados')) {
    return `Para fazer backup dos seus dados:

💾 **Relatórios:**
• Acesse "Relatórios" para exportar dados
• Disponível em Excel e PDF

🔐 **Dados na Nuvem:**
• Seus dados ficam seguros em nossos servidores
• Backup automático diário
• Acesso de qualquer lugar

📤 **Exportação:**
• Clientes, produtos e serviços podem ser exportados
• Use filtros por período quando necessário`;
  }

  // Sobre pagamentos
  if (message.includes('pagamento') || message.includes('cobrança') || message.includes('financeiro')) {
    return `Gestão financeira no sistema:

💰 **Contas a Receber:**
• Registre pagamentos de clientes
• Controle de vencimentos
• Status: Pendente, Pago, Vencido

💳 **Contas a Pagar:**
• Gerencie fornecedores
• Controle de despesas
• Categorização de gastos

📊 **Relatórios:**
• Fluxo de caixa
• Faturamento por período
• Análise de receitas e despesas`;
  }

  // Suporte técnico
  if (message.includes('problema') || message.includes('erro') || message.includes('não funciona') || message.includes('bug')) {
    return `Vejo que você está com dificuldades. Vamos resolver!

🔧 **Problemas Comuns:**
• Limpe o cache do navegador (Ctrl+F5)
• Verifique sua conexão com internet
• Tente usar outro navegador

📞 **Suporte Direto:**
• WhatsApp: (46) 99932-4779
• Chat ao vivo nas configurações
• E-mail: suporte@oficinago.com

🕐 **Horário de Atendimento:**
• Segunda a Sexta: 8h às 18h
• Sábado: 8h às 12h

Posso ajudar com algo específico?`;
  }

  // Sobre relatórios
  if (message.includes('relatório') || message.includes('relatorio') || message.includes('gráfico')) {
    return `Relatórios disponíveis no sistema:

📈 **Dashboard:**
• Resumo de vendas do mês
• Clientes atendidos
• Serviços mais realizados

📊 **Relatórios Detalhados:**
• Faturamento por período
• Produtos mais vendidos
• Histórico de clientes
• Ordens de serviço realizadas

💾 **Exportação:**
• PDF para impressão
• Excel para análise
• Filtros por data, cliente ou produto`;
  }

  // Agendamentos
  if (message.includes('agendamento') || message.includes('agendar') || message.includes('calendário')) {
    return `Para gerenciar agendamentos:

📅 **Novo Agendamento:**
1️⃣ Acesse "Agendamentos"
2️⃣ Clique em "Novo Agendamento"
3️⃣ Selecione cliente e serviço
4️⃣ Escolha data e horário
5️⃣ Adicione observações

📱 **Notificações:**
• Configure lembretes automáticos
• Cliente recebe confirmação por SMS/Email
• Avisos de reagendamento

🗓️ **Visualização:**
• Calendário mensal
• Lista de agendamentos do dia
• Status: Agendado, Confirmado, Realizado`;
  }

  // Configurações
  if (message.includes('configuração') || message.includes('configurar') || message.includes('configurações')) {
    return `Principais configurações do sistema:

⚙️ **Perfil da Oficina:**
• Nome, CNPJ e dados da empresa
• Logo personalizada
• Informações de contato

🔔 **Notificações:**
• Alertas de estoque baixo
• Lembretes de agendamento
• Confirmações de pagamento

🎨 **Personalização:**
• Tema claro/escuro
• Layout responsivo
• Atalhos personalizados

📞 **Suporte:**
• Chat ao vivo integrado
• WhatsApp comercial
• Central de ajuda`;
  }

  // Sobre preços
  if (message.includes('preço') || message.includes('valor') || message.includes('custo') || message.includes('plano')) {
    return `Informações sobre planos e preços:

💎 **Plano Essencial:**
• Até 50 clientes
• Gestão básica de estoque
• Orçamentos e OS ilimitados
• Suporte por email

🚀 **Plano Premium:**
• Clientes ilimitados
• Relatórios avançados
• Notificações automáticas
• Suporte prioritário
• Integração WhatsApp

💰 **Preços atualizados em:** www.oficinago.com/precos

🎁 **Teste grátis:** 7 dias sem compromisso!`;
  }

  // Sobre segurança
  if (message.includes('segurança') || message.includes('seguro') || message.includes('proteção')) {
    return `Sua segurança é nossa prioridade:

🔐 **Proteção de Dados:**
• Criptografia SSL/TLS
• Servidores seguros na nuvem
• Backup automático diário
• Conformidade com LGPD

👤 **Controle de Acesso:**
• Senhas criptografadas
• Sessões seguras
• Logs de atividade

🛡️ **Certificações:**
• ISO 27001 (Segurança da Informação)
• Servidores no Brasil
• Monitoramento 24/7

Seus dados estão 100% protegidos!`;
  }

  // Integração WhatsApp
  if (message.includes('whatsapp') || message.includes('integração')) {
    return `Integração com WhatsApp:

📱 **Recursos Disponíveis:**
• Notificações automáticas para clientes
• Confirmação de agendamentos
• Lembretes de pagamento
• Orçamentos por WhatsApp

⚙️ **Como Configurar:**
1️⃣ Acesse "Configurações > WhatsApp"
2️⃣ Conecte seu número comercial
3️⃣ Configure mensagens automáticas
4️⃣ Teste o envio

💬 **Mensagens Automáticas:**
• "Seu agendamento foi confirmado"
• "Orçamento pronto para análise"
• "Veículo pronto para retirada"

Facilita muito a comunicação com os clientes!`;
  }

  // Dúvidas gerais sobre o sistema
  if (message.includes('como usar') || message.includes('tutorial') || message.includes('ajuda')) {
    return `Precisa de ajuda para usar o sistema?

📚 **Recursos de Aprendizado:**
• Tutoriais em vídeo
• Manual do usuário online
• Dicas rápidas em cada tela

🎯 **Primeiros Passos:**
1️⃣ Complete seu perfil da oficina
2️⃣ Cadastre alguns produtos/serviços
3️⃣ Adicione seus primeiros clientes
4️⃣ Crie seu primeiro orçamento

💡 **Dicas de Produtividade:**
• Use atalhos do teclado
• Configure notificações
• Personalize o dashboard
• Mantenha dados atualizados

Posso ajudar com algo específico?`;
  }

  // Resposta padrão para outras perguntas
  if (message.includes('?') || message.includes('como') || message.includes('onde') || message.includes('quando')) {
    return `Entendo sua dúvida! Estou aqui para ajudar com o sistema Oficina Go.

🔍 **Posso ajudar com:**
• Como cadastrar clientes e produtos
• Criar orçamentos e ordens de serviço
• Gerenciar estoque e financeiro
• Configurar notificações
• Importar notas fiscais
• Gerar relatórios

💬 **Para suporte específico:**
• WhatsApp: (46) 99932-4779
• Chat ao vivo nas configurações
• E-mail: suporte@oficinago.com

Qual funcionalidade específica gostaria de saber mais?`;
  }

  // Resposta padrão para mensagens não reconhecidas
  return `Obrigado por entrar em contato! 😊

Como assistente virtual da Oficina Go, posso ajudar você com:

🚗 **Gestão da Oficina:**
• Cadastro de clientes e veículos
• Criação de orçamentos e OS
• Controle de estoque
• Agendamentos

💰 **Financeiro:**
• Contas a pagar e receber
• Relatórios de faturamento
• Controle de despesas

⚙️ **Configurações:**
• Personalização do sistema
• Integração WhatsApp
• Notificações automáticas

Digite sua dúvida ou escolha um tópico que posso explicar melhor!`;
};