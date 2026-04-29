from app.database.client import supabase

def buscar_por_cargo_id(cargo_id: str):

    result = supabase.table("pcfp") \
        .select("*") \
        .eq("cargo_id", cargo_id) \
        .execute()

    if not result.data:
        return None

    return result.data[0]


def salvar_pcfp(cargo_id: str, estrutura: dict):
    return supabase.table("pcfp") \
        .upsert({
            "cargo_id": cargo_id,
            "estrutura": estrutura,
            "bloqueado": False
        }, on_conflict="cargo_id") \
        .execute().data[0]


def salvar_versao(data: dict):
    return supabase.table("versoes_repactuacao") \
        .insert(data) \
        .execute().data[0]


def buscar_ultima_versao(cargo_id: str):
    res = supabase.table("versoes_repactuacao") \
        .select("numero_versao") \
        .eq("cargo_id", cargo_id) \
        .order("numero_versao", desc=True) \
        .limit(1) \
        .execute()
    
    return res.data[0] if res.data else None