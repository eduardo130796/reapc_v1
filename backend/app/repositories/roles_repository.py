from app.database.client import supabase, supabase_admin


def listar():
    return supabase.table("roles").select("*").execute().data


def inserir(data: dict):
    return supabase.table("roles").insert(data).execute().data[0]


def deletar(role_id: str):
    res = supabase.table("roles") \
        .delete() \
        .eq("id", role_id) \
        .execute()

    return bool(res.data)

def get_role_by_id(role_id: int):

    res = supabase_admin.table("roles") \
        .select("*") \
        .eq("id", role_id) \
        .single() \
        .execute()

    return res.data if res.data else None