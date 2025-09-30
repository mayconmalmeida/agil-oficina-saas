# Configuração dos Planos de Pagamento - Cakto

Este documento contém as instruções para finalizar a configuração dos planos de pagamento integrados com o Cakto.

## ✅ Status Atual

### Concluído
- ✅ Webhook do Cakto configurado (`cakto-webhook/index.ts`)
- ✅ Validação de assinatura webhook
- ✅ Mapeamento de produtos para planos
- ✅ Scripts de atualização criados

### Pendente
- ❌ Políticas RLS da tabela `plan_configurations`
- ❌ Tabela `payment_transactions`
- ❌ Atualização dos preços dos planos

## 🚀 Próximos Passos (Execute no Supabase Dashboard)

### 1. Corrigir Políticas RLS (OBRIGATÓRIO)

**Acesse:** Supabase Dashboard > SQL Editor

**Execute o arquivo:** `fix-plan-configurations-rls.sql`

```sql
-- O arquivo contém:
-- 1. Remoção de políticas restritivas
-- 2. Criação de políticas que permitem:
--    - Leitura pública (para páginas de preços)
--    - Modificação por admins
--    - Acesso completo para service role
```

### 2. Criar Tabela de Transações (OBRIGATÓRIO)

**Execute o arquivo:** `create-payment-transactions-table.sql`

```sql
-- Cria tabela payment_transactions com:
-- - Campos para transações de pagamento
-- - Políticas RLS adequadas
-- - Índices para performance
-- - Trigger para updated_at
```

### 3. Atualizar Planos (Após passos 1 e 2)

**Execute no terminal:**
```bash
node update-plans-with-full-data.cjs
```

## 📋 Configuração Final dos Planos

Após executar os passos acima, os planos ficarão configurados como:

### Plano Essencial Mensal
- **Preço:** R$ 197,90
- **Link Cakto:** https://checkout.cackto.com.br/essencial/mensal
- **Recursos:**
  - Gestão de clientes e veículos
  - Orçamentos e ordens de serviço
  - Controle financeiro básico
  - Relatórios essenciais
  - Suporte por email

### Plano Premium Anual
- **Preço:** R$ 1.970,00
- **Link Cakto:** https://checkout.cackto.com.br/premium/anual
- **Recursos:**
  - Todos os recursos do plano Essencial
  - Módulo de estoque integrado
  - Agendamento de serviços
  - Relatórios avançados
  - Suporte prioritário
  - Backup automático
  - Integração com contabilidade
  - 2 meses grátis (economia de R$ 359,80)

## 🔧 Arquivos Criados

1. **fix-plan-configurations-rls.sql** - Corrige políticas de segurança
2. **create-payment-transactions-table.sql** - Cria tabela de transações
3. **update-plans-with-full-data.cjs** - Atualiza planos com dados corretos
4. **cakto-webhook/index.ts** - Webhook completo do Cakto

## ⚠️ Importante

- Execute os arquivos SQL **EXATAMENTE** na ordem indicada
- Aguarde a confirmação de sucesso antes de prosseguir
- Teste os planos após a configuração

## 🧪 Verificação

Após completar todos os passos, execute:
```bash
node test-plan-configurations.cjs
```

Deve mostrar os planos com os preços corretos:
- Essencial Mensal: R$ 197,90
- Premium Anual: R$ 1.970,00

## 📞 Suporte

Se encontrar problemas, verifique:
1. Se executou os arquivos SQL na ordem correta
2. Se as políticas RLS foram aplicadas
3. Se a tabela payment_transactions foi criada
4. Se há erros no console do navegador