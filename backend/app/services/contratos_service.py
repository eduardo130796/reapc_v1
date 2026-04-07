from fastapi import HTTPException
from app.core.response import success
from app.repositories import contratos_repository as repo
from app.services.audit_service import registrar_log


ENTITY = "contratos"


def listar_contratos_service(user):
    data = repo.listar()
    return success(data)


def buscar_contrato_service(contrato_id: str, user):
    contrato = repo.buscar_por_id(contrato_id)

    if not contrato:
        raise HTTPException(404, "Contrato não encontrado")

    return success(contrato)


def criar_contrato_service(payload, user):
    data = repo.inserir(payload.model_dump())

    registrar_log(
        user_id=user["id"],
        action="create",
        entity=ENTITY,
        entity_id=data["id"],
        payload=data
    )

    return success(data, "Contrato criado com sucesso")


def atualizar_contrato_service(contrato_id: str, payload, user):
    contrato = repo.buscar_por_id(contrato_id)

    if not contrato:
        raise HTTPException(404, "Contrato não encontrado")

    data = repo.atualizar(contrato_id, payload.model_dump(exclude_none=True))

    registrar_log(
        user_id=user["id"],
        action="update",
        entity=ENTITY,
        entity_id=contrato_id,
        payload=payload.model_dump(exclude_none=True)
    )

    return success(data, "Contrato atualizado")


def excluir_contrato_service(contrato_id: str, user):
    contrato = repo.buscar_por_id(contrato_id)

    if not contrato:
        raise HTTPException(404, "Contrato não encontrado")

    repo.deletar(contrato_id)

    registrar_log(
        user_id=user["id"],
        action="delete",
        entity=ENTITY,
        entity_id=contrato_id
    )

    return success(message="Contrato removido")