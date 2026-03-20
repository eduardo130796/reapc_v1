from fastapi import APIRouter
from app.database.supabase import supabase

router = APIRouter(prefix="/calculos", tags=["Calculos"])


@router.post("/")
def salvar_calculo(data: dict):

    response = supabase.table("historico_calculos").insert(data).execute()

    return response.data