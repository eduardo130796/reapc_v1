-- Adiciona vínculo de CCT nos contratos
ALTER TABLE contratos ADD COLUMN IF NOT EXISTS cct_id UUID REFERENCES ccts(id);

-- Comentário para documentação
COMMENT ON COLUMN contratos.cct_id IS 'Vínculo com a Convenção Coletiva de Trabalho utilizada para os cálculos do contrato.';
