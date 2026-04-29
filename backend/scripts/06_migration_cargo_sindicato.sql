-- Migração: Vincula cargo ao sindicato (não mais à CCT diretamente)
ALTER TABLE public.cargos
    ADD COLUMN IF NOT EXISTS sindicato_id UUID REFERENCES public.sindicatos(id);

COMMENT ON COLUMN public.cargos.sindicato_id IS
    'Sindicato responsável pelo cargo. Utilizado para buscar a CCT correspondente na PCFP.';
