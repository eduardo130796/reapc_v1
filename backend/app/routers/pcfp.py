from fastapi import APIRouter, HTTPException
from app.schemas.pcfp_schema import PCFPInput
from app.services.engine_service import executar_calculo
from pathlib import Path
import json
from app.database.supabase import supabase
from fastapi.responses import StreamingResponse
import pandas as pd
import io

router = APIRouter(prefix="/pcfp", tags=["PCFP"])


@router.post("/calcular")
def calcular_pcfp(data: PCFPInput):

    estrutura = data.estrutura
    parametros = data.parametros

    if "modulos" not in estrutura:
        raise HTTPException(
            status_code=400,
            detail="Estrutura inválida: campo 'modulos' não encontrado"
        )

    resultado = executar_calculo(
        estrutura,
        parametros
    )

    return resultado

@router.get("/template")
def template():

    path = Path("app/templates/modelo_base_v2.json")

    with open(path, "r", encoding="utf-8") as f:
        modelo = json.load(f)

    return modelo

@router.post("/simular/{modelo_id}")
def simular_modelo(modelo_id: str, parametros: dict):

    response = (
        supabase
        .table("modelos_pcfp")
        .select("estrutura,nome,versao")
        .eq("id", modelo_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Modelo não encontrado"
        )

    modelo = response.data[0]

    estrutura = modelo["estrutura"]

    resultado = executar_calculo(
        estrutura,
        parametros
    )

    return {
        "modelo": modelo["nome"],
        "versao": modelo["versao"],
        "resultado": resultado
    }

@router.get("/parametros/{modelo_id}")
def parametros_modelo(modelo_id: str):

    response = (
        supabase
        .table("modelos_pcfp")
        .select("estrutura")
        .eq("id", modelo_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Modelo não encontrado")

    estrutura = response.data[0]["estrutura"]

    parametros = set()

    for modulo in estrutura["modulos"]:

        for item in modulo.get("itens", []):
            if item["tipo"] == "parametro":
                parametros.add(item["id_tecnico"])

            if "parametro" in item:
                parametros.add(item["parametro"])

        for sub in modulo.get("submodulos", []):
            for item in sub.get("itens", []):

                if item["tipo"] == "parametro":
                    parametros.add(item["id_tecnico"])

                if "parametro" in item:
                    parametros.add(item["parametro"])

    return {
        "parametros": sorted(list(parametros))
    }

@router.post("/simular/{modelo_id}")
def simular_modelo(modelo_id: str, parametros: dict):

    response = (
        supabase
        .table("modelos_pcfp")
        .select("estrutura,nome,versao")
        .eq("id", modelo_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Modelo não encontrado")

    modelo = response.data[0]

    estrutura = modelo["estrutura"]

    resultado = executar_calculo(
        estrutura,
        parametros
    )

    return {
        "modelo": modelo["nome"],
        "versao": modelo["versao"],
        "resultado": resultado
    }

@router.post("/exportar/{modelo_id}")
def exportar_excel(modelo_id: str, parametros: dict):

    response = (
        supabase
        .table("modelos_pcfp")
        .select("estrutura")
        .eq("id", modelo_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Modelo não encontrado")

    estrutura = response.data[0]["estrutura"]

    resultado = executar_calculo(
        estrutura,
        parametros
    )

    df = pd.DataFrame(
        list(resultado.items()),
        columns=["item", "valor"]
    )

    output = io.BytesIO()

    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, index=False)

    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=pcfp.xlsx"}
    )

@router.post("/cargo")
def criar_cargo(data: dict):

    modelo = (
        supabase
        .table("modelos_pcfp")
        .select("estrutura")
        .eq("id", data["modelo_id"])
        .execute()
    )

    estrutura = modelo.data[0]["estrutura"]

    cargo = (
        supabase
        .table("cargos_contrato")
        .insert({
            "contrato_id": data["contrato_id"],
            "nome_cargo": data["nome_cargo"],
            "modelo_id": data["modelo_id"],
            "estrutura_planilha": estrutura
        })
        .execute()
    )

    return cargo.data

@router.post("/cargo/{cargo_id}/calcular")
def calcular_cargo(cargo_id: str, parametros: dict):

    cargo = (
        supabase
        .table("cargos_contrato")
        .select("*")
        .eq("id", cargo_id)
        .execute()
    )

    estrutura = cargo.data[0]["estrutura_planilha"]

    resultado = executar_calculo(
        estrutura,
        parametros
    )

    supabase.table("cargos_contrato").update({
        "parametros": parametros,
        "resultado": resultado
    }).eq("id", cargo_id).execute()

    return resultado