from app.database.client import supabase


def listar_por_contrato(contrato_id: str):
    return supabase.table("cargos") \
        .select("*, cargos_base(*), sindicato:sindicatos(*)") \
        .eq("contrato_id", contrato_id) \
        .order("created_at", desc=True) \
        .execute().data


def buscar_por_id(cargo_id: str):
    res = supabase.table("cargos") \
        .select("*, cargos_base(*), sindicato:sindicatos(*)") \
        .eq("id", cargo_id) \
        .execute()

    return res.data[0] if res.data else None


def inserir(data: dict):
    res = supabase.table("cargos") \
        .insert(data) \
        .execute()

    return res.data[0]


def atualizar(cargo_id: str, data: dict):
    res = supabase.table("cargos") \
        .update(data) \
        .eq("id", cargo_id) \
        .execute()

    return res.data[0] if res.data else None


def deletar(cargo_id: str):
    res = supabase.table("cargos") \
        .delete() \
        .eq("id", cargo_id) \
        .execute()

    return bool(res.data)