from app.database.client import supabase

def listar_cargos_base():
    return supabase.table("cargos_base").select("*").order("nome").execute().data

def buscar_por_nome(nome: str):
    res = supabase.table("cargos_base").select("*").ilike("nome", nome.strip()).execute()
    return res.data[0] if res.data else None

def buscar_por_id(cargo_id: str):
    res = supabase.table("cargos_base").select("*").eq("id", cargo_id).execute()
    return res.data[0] if res.data else None

def inserir_cargo_base(data: dict):
    res = supabase.table("cargos_base").insert(data).execute()
    return res.data[0]
