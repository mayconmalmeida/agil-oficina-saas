# 🎯 INSTRUÇÕES FINAIS - Configuração dos Planos Cakto

## 📊 Status Atual

✅ **Configurações Completas:**
- Webhook Cakto configurado e funcionando
- Tabela `payment_transactions` criada
- Links de afiliado Cakto configurados

❌ **Pendente:**
- Preços dos planos incorretos (bloqueados por RLS)

## 🔧 Solução Final

Execute os seguintes scripts **no Supabase Dashboard → SQL Editor** na ordem exata:

### 1️⃣ Primeiro Script: `fix-plan-configurations-rls-safe.sql`
```sql
-- Este script corrige as políticas RLS
-- Cole todo o conteúdo do arquivo no SQL Editor
```

### 2️⃣ Segundo Script: `final-plan-fix.sql`
```sql
-- Este script força a atualização dos preços
-- Cole todo o conteúdo do arquivo no SQL Editor
```

## 📋 Passos Detalhados

1. **Acesse o Supabase Dashboard**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Abra o SQL Editor**
   - Menu lateral → SQL Editor
   - Clique em "New query"

3. **Execute o primeiro script**
   - Copie todo o conteúdo de `fix-plan-configurations-rls-safe.sql`
   - Cole no editor
   - Clique em "Run"

4. **Execute o segundo script**
   - Abra uma nova query
   - Copie todo o conteúdo de `final-plan-fix.sql`
   - Cole no editor
   - Clique em "Run"

5. **Verifique o resultado**
   - Execute no terminal: `node verify-final-setup.cjs`
   - Deve mostrar: ✅ Todos os problemas resolvidos

## 🎯 Resultado Esperado

Após executar os scripts, os planos devem ter:

- **Plano Mensal**: R$ 197,90
- **Plano Anual**: R$ 1.970,00

## ⚠️ Importante

- Execute os scripts **exatamente nesta ordem**
- Use o **Supabase Dashboard**, não o terminal
- Aguarde cada script terminar antes do próximo

## 🔍 Verificação Final

Execute para confirmar:
```bash
node verify-final-setup.cjs
```

Deve mostrar: **✅ CONFIGURAÇÃO COMPLETA**