from fastapi import HTTPException
from app.core.response import success
from app.repositories import modelos_repository as repo
from app.services.audit_service import registrar_log


ENTITY = "modelos"


def listar_modelos_service(user):
    data = repo.listar()
    return success(data)


def criar_modelo_service(payload, user):

    existentes = repo.buscar_por_nome(payload.nome)

    versao = 1
    if existentes:
        versoes = [m["versao"] for m in existentes]
        versao = max(versoes) + 1

    data = repo.inserir({
        "nome": payload.nome,
        "versao": versao,
        "estrutura": payload.estrutura,
        "ativo": payload.ativo
    })

    registrar_log(
        user_id=user["id"],
        action="create",
        entity=ENTITY,
        entity_id=data["id"],
        payload=data
    )

    return success(data, "Modelo criado")


def atualizar_modelo_service(modelo_id: str, payload, user):

    data = repo.atualizar(
        modelo_id,
        payload.model_dump(exclude_none=True)
    )

    if not data:
        raise HTTPException(404, "Modelo não encontrado")

    registrar_log(
        user_id=user["id"],
        action="update",
        entity=ENTITY,
        entity_id=modelo_id,
        payload=payload.model_dump(exclude_none=True)
    )

    return success(data, "Modelo atualizado")


def excluir_modelo_service(modelo_id: str, user):

    deleted = repo.deletar(modelo_id)

    if not deleted:
        raise HTTPException(404, "Modelo não encontrado")

    registrar_log(
        user_id=user["id"],
        action="delete",
        entity=ENTITY,
        entity_id=modelo_id
    )

    return success(message="Modelo removido")

