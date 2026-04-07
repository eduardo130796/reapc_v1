from fastapi import HTTPException
from app.core.response import success
from app.calculators.pcfp_calculator import calcular_pcfp
from app.database.client import supabase
from app.services.audit_service import registrar_log
from app.repositories import pcfp_repository as repo
from app.core.response import success
from app.calculators.pcfp_calculator import calcular_pcfp_simulacao

ENTITY = "pcfp"


def calcular_service(payload, user):
    try:
        resultado = calcular_pcfp(
            payload.estrutura,
            payload.parametros
        )
        # 🔥 PEGA TOTAL FINAL (ajusta conforme seu modelo)
        total = list(resultado.values())[-1]


        # 🔥 ATUALIZA VALOR DO CARGO
        supabase.table("cargos") \
            .update({
                "valor_unitario": total
            }) \
            .eq("id", payload.cargo_id) \
            .execute()

        # 🔥 BLOQUEIA PCFP
        supabase.table("pcfp") \
            .update({
                "bloqueado": True
            }) \
            .eq("cargo_id", payload.cargo_id) \
            .execute()

        #registrar_log(
        #    user["id"],
        #    "calculate",
        #    ENTITY,
        #    payload={"total": total}
        #)

        return success({
            "total": total,
            "detalhado": resultado
        })

    except ValueError as e:
        raise HTTPException(400, str(e))
    
def buscar_pcfp_service(cargo_id: str):

    pcfp = repo.buscar_por_cargo_id(cargo_id)

    if not pcfp:
        return success(None)

    # 🔒 garante estrutura válida
    if not pcfp.get("estrutura"):
        pcfp["estrutura"] = {}

    return success(pcfp)

def salvar_estrutura_service(cargo_id: str, estrutura: dict):
    existe = repo.buscar_por_cargo_id(cargo_id)
    if existe:
        supabase.table("pcfp") \
            .update({"estrutura": estrutura}) \
            .eq("cargo_id", cargo_id) \
            .execute()
    else:
        supabase.table("pcfp") \
            .insert({
                "cargo_id": cargo_id,
                "estrutura": estrutura,
                "bloqueado": False
            }) \
            .execute()
    return success(True)

def simular_estrutura_service(estrutura, parametros):

    resultado = calcular_pcfp_simulacao(
        estrutura=estrutura,
        parametros=parametros
    )

    return resultado