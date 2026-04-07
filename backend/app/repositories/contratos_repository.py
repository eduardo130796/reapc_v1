from app.database.client import supabase


def listar():
    return supabase.table("contratos").select("*").execute().data


def buscar_por_id(contrato_id: str):
    res = supabase.table("contratos") \
        .select("*") \
        .eq("id", contrato_id) \
        .execute()

    return res.data[0] if res.data else None


def inserir(data: dict):
    res = supabase.table("contratos") \
        .insert(data) \
        .execute()

    return res.data[0]


def atualizar(contrato_id: str, data: dict):
    res = supabase.table("contratos") \
        .update(data) \
        .eq("id", contrato_id) \
        .execute()

    return res.data[0] if res.data else None


def deletar(contrato_id: str):
    res = supabase.table("contratos") \
        .delete() \
        .eq("id", contrato_id) \
        .execute()

    return bool(res.data)