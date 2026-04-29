-- 1. Criação da Tabela de Catálogo Global de Cargos
CREATE TABLE public.cargos_base (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Migração: Inserindo cargos únicos já existentes na tabela cct_valores
INSERT INTO public.cargos_base (nome)
SELECT DISTINCT TRIM(UPPER(codigo_cargo))
FROM public.cct_valores
WHERE codigo_cargo IS NOT NULL 
ON CONFLICT (nome) DO NOTHING;

-- O opcional: Também inserir dos contratos caso queira uniformizar
INSERT INTO public.cargos_base (nome)
SELECT DISTINCT TRIM(UPPER(nome))
FROM public.cargos
WHERE nome IS NOT NULL
ON CONFLICT (nome) DO NOTHING;

-- 3. Adicionar coluna referencial cargo_id em cct_valores
ALTER TABLE public.cct_valores
ADD COLUMN cargo_id UUID REFERENCES public.cargos_base(id);

-- 4. Atualizar o cargo_id na tabela cct_valores baseado no texto antigo
UPDATE public.cct_valores v
SET cargo_id = b.id
FROM public.cargos_base b
WHERE TRIM(UPPER(v.codigo_cargo)) = b.nome;

-- 5. Tornar a nova coluna NOT NULL e dropar a coluna antiga
-- ATENÇÃO: Verifique se todos os registros receberam cargo_id antes de dropar!
ALTER TABLE public.cct_valores
ALTER COLUMN cargo_id SET NOT NULL,
DROP COLUMN codigo_cargo;

-- Permissões RLs se você as usa estritamente
ALTER TABLE public.cargos_base ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.cargos_base FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.cargos_base FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON public.cargos_base FOR UPDATE TO authenticated USING (true);
