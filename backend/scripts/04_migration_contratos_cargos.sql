-- 1. Adicionar a coluna relacional na tabela de cargos (específicos do contrato)
ALTER TABLE public.cargos
ADD COLUMN cargo_id UUID REFERENCES public.cargos_base(id);

-- 2. Garantir que os nomes atuais existam como catálogo base!
-- Caso já tenhamos rodado a migration 03, isso vai garantir os novos apenas
INSERT INTO public.cargos_base (nome)
SELECT DISTINCT TRIM(UPPER(nome))
FROM public.cargos
WHERE nome IS NOT NULL
ON CONFLICT (nome) DO NOTHING;

-- 3. Atualizar relacionamentos: preencher o UUID recém inserido baseado em nome matchando a base global
UPDATE public.cargos c
SET cargo_id = b.id
FROM public.cargos_base b
WHERE TRIM(UPPER(c.nome)) = b.nome;

-- 4. Tornar a nova coluna cargo_id OBRIGATÓRIA
-- Certifique-se de que nenhum registro ficou nulo!
ALTER TABLE public.cargos
ALTER COLUMN cargo_id SET NOT NULL;

-- 5. (Opcional) A coluna `nome` da tabela `cargos` não precisa mais ser enviada no body do POST, 
-- pois agora consumiremos via `JOIN cargos_base`. 
-- Ainda assim podemos deixá-la nula ou não para manter retrocompatibilidade até testar o front.
