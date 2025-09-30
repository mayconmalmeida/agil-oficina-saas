-- Atualizar função create_budget para suportar itens
CREATE OR REPLACE FUNCTION create_budget_with_items(
  p_user_id UUID,
  p_cliente TEXT,
  p_veiculo TEXT,
  p_descricao TEXT,
  p_valor_total DECIMAL,
  p_itens JSONB DEFAULT '[]'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_orcamento_id UUID;
  v_item JSONB;
BEGIN
  -- Inserir orçamento
  INSERT INTO public.orcamentos (
    user_id,
    cliente,
    veiculo,
    descricao,
    valor_total,
    status,
    created_at
  ) VALUES (
    p_user_id,
    p_cliente,
    p_veiculo,
    p_descricao,
    p_valor_total,
    'pendente',
    now()
  ) RETURNING id INTO v_orcamento_id;
  
  -- Inserir itens se fornecidos
  IF p_itens IS NOT NULL AND jsonb_array_length(p_itens) > 0 THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_itens)
    LOOP
      INSERT INTO public.orcamento_itens (
        orcamento_id,
        user_id,
        item_id,
        nome,
        tipo,
        quantidade,
        valor_unitario,
        valor_total
      ) VALUES (
        v_orcamento_id,
        p_user_id,
        (v_item->>'id')::UUID,
        v_item->>'nome',
        v_item->>'tipo',
        (v_item->>'quantidade')::INTEGER,
        (v_item->>'valor_unitario')::DECIMAL,
        (v_item->>'valor_total')::DECIMAL
      );
    END LOOP;
  END IF;
  
  RETURN v_orcamento_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Manter função original para compatibilidade
CREATE OR REPLACE FUNCTION create_budget(
  p_user_id UUID,
  p_cliente TEXT,
  p_veiculo TEXT,
  p_descricao TEXT,
  p_valor_total DECIMAL
) RETURNS VOID AS $$
BEGIN
  PERFORM create_budget_with_items(
    p_user_id,
    p_cliente,
    p_veiculo,
    p_descricao,
    p_valor_total,
    '[]'::jsonb
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;