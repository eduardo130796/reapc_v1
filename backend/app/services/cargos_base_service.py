from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from app.core.response import success
from app.repositories import cargos_base_repository as repo

def listar_cargos_base_service():
    try:
        data = repo.listar_cargos_base()
        return success(jsonable_encoder(data))
    except Exception as e:
        raise HTTPException(500, f"Erro ao listar catálogo de cargos: {str(e)}")

def criar_cargo_base_service(payload):
    try:
        nome_formatado = payload.nome.strip().upper()
        existente = repo.buscar_por_nome(nome_formatado)
        if existente:
            return success(jsonable_encoder(existente), "Cargo já existe no catálogo")

        data_to_insert = {"nome": nome_formatado}
        data = repo.inserir_cargo_base(data_to_insert)
        return success(jsonable_encoder(data), "Cargo adicionado ao catálogo com sucesso")
    except Exception as e:
        raise HTTPException(500, f"Erro ao adicionar cargo ao catálogo: {str(e)}")
