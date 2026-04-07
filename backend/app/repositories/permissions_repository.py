from app.database.client import supabase, supabase_admin


def listar():
    return supabase.table("permissions").select("*").execute().data


def inserir(data: dict):
    return supabase.table("permissions").insert(data).execute().data[0]


def salvar_role_permissions(role_id: str, permissoes: list):
    supabase.table("role_permissions") \
        .delete() \
        .eq("role_id", role_id) \
        .execute()

    if permissoes:
        data = [
            {"role_id": role_id, "permission_id": p["id"]}
            for p in permissoes
        ]

        supabase.table("role_permissions").insert(data).execute()

    return True

def get_permissions_by_role(role_id: int):

    res = supabase_admin.table("role_permissions") \
        .select("""
            permission:permissions (
                id,
                resource,
                action
            )
        """) \
        .eq("role_id", role_id) \
        .execute()

    if not res.data:
        return []

    # flatten
    permissions = [
        item["permission"]
        for item in res.data
        if item.get("permission")
    ]

    return permissions