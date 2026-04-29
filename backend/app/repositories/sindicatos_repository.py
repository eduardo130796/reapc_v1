from app.database.client import supabase

def listar_sindicatos():
    return supabase.table("sindicatos").select("*").order("nome").execute().data

def buscar_sindicato_por_id(sindicato_id: str):
    res = supabase.table("sindicatos").select("*").eq("id", sindicato_id).execute()
    return res.data[0] if res.data else None

def buscar_sindicato_por_cnpj(cnpj: str):
    res = supabase.table("sindicatos").select("*").eq("cnpj", cnpj).execute()
    return res.data[0] if res.data else None

def inserir_sindicato(data: dict):
    res = supabase.table("sindicatos").insert(data).execute()
    return res.data[0]
