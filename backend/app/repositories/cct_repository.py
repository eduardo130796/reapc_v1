from app.database.client import supabase

# --- CCTs ---

def listar_ccts():
    return supabase.table("ccts").select("*, sindicato:sindicatos(*)").order("created_at", desc=True).execute().data

def listar_por_sindicato(sindicato_id: str):
    return supabase.table("ccts") \
        .select("*, sindicato:sindicatos(*)") \
        .eq("sindicato_id", sindicato_id) \
        .order("data_base", desc=True) \
        .execute().data

def buscar_cct_por_id(cct_id: str):
    res = supabase.table("ccts").select("*, sindicato:sindicatos(*)").eq("id", cct_id).execute()
    return res.data[0] if res.data else None

def buscar_ccts_por_chave(sindicato_id: str, categoria: str, cnae: str, uf: str):
    res = supabase.table("ccts").select("*") \
        .eq("sindicato_id", sindicato_id) \
        .eq("categoria", categoria) \
        .eq("cnae", cnae) \
        .eq("uf", uf) \
        .execute()
    return res.data

def buscar_cct_por_chave(sindicato_cnpj: str, categoria: str, cnae: str, uf: str, versao: str):
    res = supabase.table("ccts").select("*") \
        .eq("sindicato_cnpj", sindicato_cnpj) \
        .eq("categoria", categoria) \
        .eq("cnae", cnae) \
        .eq("uf", uf) \
        .eq("versao", versao) \
        .execute()
    return res.data[0] if res.data else None

def inserir_cct(data: dict):
    res = supabase.table("ccts").insert(data).execute()
    return res.data[0]

def atualizar_cct(cct_id: str, data: dict):
    res = supabase.table("ccts").update(data).eq("id", cct_id).execute()
    return res.data[0] if res.data else None

# --- ITENS ---

def listar_itens(cct_id: str):
    return supabase.table("cct_itens").select("*").eq("cct_id", cct_id).order("ordem_calculo").execute().data

def inserir_item(data: dict):
    res = supabase.table("cct_itens").insert(data).execute()
    return res.data[0]

def buscar_item_por_codigo(cct_id: str, codigo_item: str):
    res = supabase.table("cct_itens").select("*").eq("cct_id", cct_id).eq("codigo_item", codigo_item).execute()
    return res.data[0] if res.data else None

# --- VALORES ---

def listar_valores(cct_id: str):
    return supabase.table("cct_valores").select("*, cargo:cargos_base(*)").eq("cct_id", cct_id).execute().data

def listar_valores_por_cargo(cct_id: str, cargo_id: str):
    return supabase.table("cct_valores").select("*, cargo:cargos_base(*)").eq("cct_id", cct_id).eq("cargo_base_id", cargo_id).execute().data

def buscar_valor_especifico(cct_id: str, cargo_id: str, codigo_item: str):
    res = supabase.table("cct_valores") \
        .select("*") \
        .eq("cct_id", cct_id) \
        .eq("cargo_base_id", cargo_id) \
        .eq("codigo_item", codigo_item) \
        .execute()
    return res.data[0] if res.data else None

def inserir_valor(data: dict):
    res = supabase.table("cct_valores").insert(data).execute()
    return res.data[0]
