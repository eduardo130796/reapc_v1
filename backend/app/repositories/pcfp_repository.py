from app.database.client import supabase

def buscar_por_cargo_id(cargo_id: str):

    result = supabase.table("pcfp") \
        .select("*") \
        .eq("cargo_id", cargo_id) \
        .execute()

    if not result.data:
        return None

    return result.data[0]