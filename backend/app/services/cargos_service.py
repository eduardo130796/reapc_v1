from fastapi import HTTPException
from app.core.response import success
from app.repositories import cargos_repository as repo
from app.services.audit_service import registrar_log
import requests


ENTITY = "cargos"
BASE_URL = "https://contratos.comprasnet.gov.br/api"


def listar_cargos_service(contrato_id: str, user):
    data = repo.listar_por_contrato(contrato_id)
    return success(data)


def criar_cargo_service(payload, user):
    data = repo.inserir(payload.model_dump())

    registrar_log(
        user_id=user["id"],
        action="create",
        entity=ENTITY,
        entity_id=data["id"],
        payload=data
    )

    return success(data, "Cargo criado")


def atualizar_cargo_service(cargo_id: str, payload, user):
    cargo = repo.buscar_por_id(cargo_id)

    if not cargo:
        raise HTTPException(404, "Cargo não encontrado")

    data = repo.atualizar(
        cargo_id,
        payload.model_dump(exclude_none=True)
    )

    registrar_log(
        user_id=user["id"],
        action="update",
        entity=ENTITY,
        entity_id=cargo_id,
        payload=payload.model_dump(exclude_none=True)
    )

    return success(data, "Cargo atualizado")


def excluir_cargo_service(cargo_id: str, user):
    cargo = repo.buscar_por_id(cargo_id)

    if not cargo:
        raise HTTPException(404, "Cargo não encontrado")

    repo.deletar(cargo_id)

    registrar_log(
        user_id=user["id"],
        action="delete",
        entity=ENTITY,
        entity_id=cargo_id
    )

    return success(message="Cargo removido")


# 🔥 IMPORTAÇÃO EXTERNA (ISOLADA E SEGURA)
def importar_cargos_service(contrato_id: str, user):

    from app.database.client import supabase

    contrato = supabase.table("contratos") \
        .select("id_api") \
        .eq("id", contrato_id) \
        .single() \
        .execute()

    if not contrato.data:
        raise HTTPException(404, "Contrato não encontrado")

    id_api = contrato.data["id_api"]

    url = f"{BASE_URL}/contrato/{id_api}/itens"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        itens = response.json()
    except requests.RequestException:
        raise HTTPException(502, "Erro ao buscar itens do contrato")

    cargos = []

    for item in itens:
        nome = item.get("descricao") or item.get("descricao_complementar")

        if not nome:
            continue

        valor_raw = item.get("valor_unitario") or item.get("valorunitario") or 0

        valor = float(
            str(valor_raw).replace(".", "").replace(",", ".")
        )

        quantidade = int(item.get("quantidade", 1))

        cargos.append({
            "contrato_id": contrato_id,
            "nome": nome.strip(),
            "quantidade": quantidade,
            "valor_unitario": valor,
            "status": "ativo"
        })

    if cargos:
        from app.database.client import supabase
        supabase.table("cargos").insert(cargos).execute()

    registrar_log(
        user_id=user["id"],
        action="import",
        entity=ENTITY,
        entity_id=contrato_id,
        payload={"qtd": len(cargos)}
    )

    return success({
        "importados": len(cargos)
    }, "Importação concluída")

def aplicar_modelo_service(cargo_id: str, payload, user):

    from app.database.client import supabase

    cargo = repo.buscar_por_id(cargo_id)

    if not cargo:
        raise HTTPException(404, "Cargo não encontrado")

    modelo_id = payload.get("modelo_id")

    modelo = supabase.table("modelos_pcfp") \
        .select("*") \
        .eq("id", modelo_id) \
        .single() \
        .execute()

    if not modelo.data:
        raise HTTPException(404, "Modelo não encontrado")

    estrutura = modelo.data.get("estrutura", {})

    # 🔥 BUSCAR PCFP EXISTENTE
    existente = supabase.table("pcfp") \
        .select("*") \
        .eq("cargo_id", cargo_id) \
        .execute()

    if existente.data:

        pcfp = existente.data[0]

        # 🚨 REGRA CRÍTICA
        if pcfp.get("bloqueado"):
            raise HTTPException(
                400,
                "Este cargo já possui uma planilha bloqueada. Não é possível alterar o modelo."
            )

        # 🔁 UPDATE (SE NÃO BLOQUEADO)
        supabase.table("pcfp") \
            .update({
                "estrutura": estrutura,
                "bloqueado": False
            }) \
            .eq("cargo_id", cargo_id) \
            .execute()

    else:

        # ➕ CREATE
        supabase.table("pcfp") \
            .insert({
                "cargo_id": cargo_id,
                "estrutura": estrutura,
                "bloqueado": False
            }) \
            .execute()

    return success(message="Modelo aplicado")