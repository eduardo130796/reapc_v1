from app.database.client import supabase_admin


def listar():
    return supabase_admin.table("usuarios").select("*").execute().data


def buscar_por_id(user_id: str):
    res = supabase_admin.table("usuarios") \
        .select("*") \
        .eq("id", user_id) \
        .execute()

    return res.data[0] if res.data else None


def inserir(data: dict):
    return supabase_admin.table("usuarios").insert(data).execute().data[0]


def atualizar_role(user_id: str, role_id: str):
    res = supabase_admin.table("usuarios") \
        .update({"role_id": role_id}) \
        .eq("id", user_id) \
        .execute()

    return res.data[0] if res.data else None

def atualizar(user_id: str, data: dict):
    res = supabase_admin.table("usuarios") \
        .update(data) \
        .eq("id", user_id) \
        .execute()

    return res.data[0] if res.data else None

def get_usuario_by_auth_id(auth_user_id: str):

    res = supabase_admin.table("usuarios") \
        .select("*") \
        .eq("auth_user_id", auth_user_id) \
        .execute()

    return res.data[0] if res.data else None

def criar_usuario(data: dict):

    res = supabase_admin.table("usuarios") \
        .insert(data) \
        .execute()

    return res.data[0]