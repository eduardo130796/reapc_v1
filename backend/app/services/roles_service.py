from app.core.response import success
from app.repositories import roles_repository as repo
from app.services.audit_service import registrar_log


ENTITY = "roles"


def listar_roles_service(user):
    return success(repo.listar())


def criar_role_service(payload, user):
    data = repo.inserir(payload.model_dump())

    registrar_log(user["id"], "create", ENTITY, data["id"], data)

    return success(data, "Role criada")


def deletar_role_service(role_id: str, user):
    repo.deletar(role_id)

    registrar_log(user["id"], "delete", ENTITY, role_id)

    return success(message="Role removida")