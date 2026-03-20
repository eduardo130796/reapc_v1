from fastapi import APIRouter
from supabase import create_client
import os

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


# ===============================
# LISTAR MODELOS
# ===============================
@router.get("/modelos")
def listar_modelos():

    response = supabase.table("modelos_pcfp") \
        .select("*") \
        .order("nome") \
        .order("versao", desc=True) \
        .execute()

    return response.data


# ===============================
# EXCLUIR MODELO
# ===============================
@router.delete("/modelos/{modelo_id}")
def excluir_modelo(modelo_id: str):

    supabase.table("modelos_pcfp") \
        .delete() \
        .eq("id", modelo_id) \
        .execute()

    return {"status": "ok"}

@router.post("/modelos")
def criar_modelo(payload: dict):

    nome = payload["nome"]
    estrutura = payload["estrutura"]

    existentes = supabase.table("modelos_pcfp") \
        .select("versao") \
        .eq("nome", nome) \
        .execute()

    versao = 1

    if existentes.data:
        versoes = [m["versao"] for m in existentes.data]
        versao = max(versoes) + 1

    supabase.table("modelos_pcfp").insert({
        "nome": nome,
        "versao": versao,
        "estrutura": estrutura,
        "ativo": True
    }).execute()

    return {"status": "ok"}

@router.put("/modelos/{modelo_id}")
def editar_modelo(modelo_id: str, payload: dict):

    supabase.table("modelos_pcfp") \
        .update({
            "nome": payload["nome"],
            "ativo": payload["ativo"],
            "estrutura": payload["estrutura"]
        }) \
        .eq("id", modelo_id) \
        .execute()

    return {"status": "ok"}