from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from app.core.response import success
from app.repositories import sindicatos_repository as repo

def listar_sindicatos_service():
    try:
        data = repo.listar_sindicatos()
        return success(jsonable_encoder(data))
    except Exception as e:
        raise HTTPException(500, f"Erro ao listar sindicatos: {str(e)}")

def criar_sindicato_service(payload):
    try:
        existente = repo.buscar_sindicato_por_cnpj(payload.cnpj)
        if existente:
            return success(jsonable_encoder(existente), "Sindicato já cadastrado")

        data = repo.inserir_sindicato(payload.model_dump())
        return success(jsonable_encoder(data), "Sindicato cadastrado com sucesso")
    except Exception as e:
        raise HTTPException(500, f"Erro ao criar sindicato: {str(e)}")
