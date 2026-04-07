from app.database.client import supabase
from fastapi import HTTPException
from app.core.response import success

def criar_versao_repactuacao(data_dict: dict):
    # Supabase table: versoes_repactuacao
    response = supabase.table("versoes_repactuacao").insert(data_dict).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Erro ao salvar versão de repactuação.")
    return success(response.data[0])

def listar_versoes_cargo(cargo_id: str):
    response = supabase.table("versoes_repactuacao") \
        .select("*") \
        .eq("cargo_id", cargo_id) \
        .order("created_at", desc=True) \
        .execute()
    
    # Se não hover, pode ser uma lista vazia
    return success(response.data)

def buscar_ultima_versao(cargo_id: str):
    # Busca da versoes_repactuacao senao busca da PCFP base.
    # O frontend pode chamar listagem e pegar a última, sem stress.
    pass
