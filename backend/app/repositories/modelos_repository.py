from app.database.client import supabase


def listar():
    return supabase.table("modelos_pcfp") \
        .select("*") \
        .order("nome") \
        .order("versao", desc=True) \
        .execute().data


def buscar_por_nome(nome: str):
    return supabase.table("modelos_pcfp") \
        .select("versao") \
        .eq("nome", nome) \
        .execute().data


def inserir(data: dict):
    res = supabase.table("modelos_pcfp") \
        .insert(data) \
        .execute()

    return res.data[0]


def atualizar(modelo_id: str, data: dict):
    res = supabase.table("modelos_pcfp") \
        .update(data) \
        .eq("id", modelo_id) \
        .execute()

    return res.data[0] if res.data else None


def deletar(modelo_id: str):
    res = supabase.table("modelos_pcfp") \
        .delete() \
        .eq("id", modelo_id) \
        .execute()

    return bool(res.data)