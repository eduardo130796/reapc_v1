from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from app.core.response import success
from app.repositories import cct_repository as repo
from app.services.audit_service import registrar_log

ENTITY_CCT = "ccts"
ENTITY_ITENS = "cct_itens"
ENTITY_VALORES = "cct_valores"

from datetime import date, timedelta

def calcular_status(data_inicio: date, data_fim: date) -> str:
    hoje = date.today()
    if not data_inicio or not data_fim:
        return "PENDENTE"
    if data_fim < hoje:
        return "VENCIDA"
    if data_inicio > hoje:
        return "PENDENTE"
    return "VIGENTE"

def listar_ccts_service(user):
    try:
        data = repo.listar_ccts()
        for item in data:
            if item.get("data_inicio") and item.get("data_fim"):
                di = date.fromisoformat(str(item["data_inicio"]))
                df = date.fromisoformat(item["data_fim"])
                novo_status = calcular_status(di, df)
                if item.get("status") != novo_status:
                    item["status"] = novo_status
        return success(jsonable_encoder(data))
    except Exception as e:
        if "relation" in str(e).lower() and "does not exist" in str(e).lower():
            raise HTTPException(500, "Tabelas do módulo CCT não encontradas. Por favor, execute o script SQL de configuração no Supabase.")
        raise HTTPException(500, f"Erro ao listar CCTs: {str(e)}")

def listar_ccts_por_sindicato_service(sindicato_id: str, user):
    try:
        data = repo.listar_por_sindicato(sindicato_id)
        return success(jsonable_encoder(data))
    except Exception as e:
        raise HTTPException(500, f"Erro ao listar CCTs por sindicato: {str(e)}")


def buscar_cct_service(cct_id: str, user):
    try:
        cct = repo.buscar_cct_por_id(cct_id)
        if not cct:
            raise HTTPException(404, "CCT não encontrada")
        return success(jsonable_encoder(cct))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Erro ao buscar CCT: {str(e)}")

def criar_cct_service(payload, user):
    try:
        if not payload.data_inicio or not payload.data_fim:
            raise HTTPException(400, "As datas de início e fim da vigência são obrigatórias")
        
        if payload.data_inicio >= payload.data_fim:
            raise HTTPException(400, "A data de início deve ser anterior à data de fim")

        # 1. Calcular status inicial
        payload.status = calcular_status(payload.data_inicio, payload.data_fim)

        # 2. Lógica de Sucessão e Bloqueio de Conflitos
        # Buscar CCTs existentes para a mesma chave
        existentes = repo.buscar_ccts_por_chave(
            sindicato_id=payload.sindicato_id,
            categoria=payload.categoria,
            cnae=payload.cnae,
            uf=payload.uf
        )

        for ex in existentes:
            ex_inicio = date.fromisoformat(ex["data_inicio"])
            ex_fim = date.fromisoformat(ex["data_fim"])

            # Se a nova CCT começa dentro do período de uma existente
            if ex_inicio <= payload.data_inicio <= ex_fim:
                # Truncar a anterior (mudar para VENCIDA no dia anterior à nova)
                nova_data_fim = payload.data_inicio - timedelta(days=1)
                repo.atualizar_cct(ex["id"], {
                    "data_fim": nova_data_fim.isoformat(),
                    "status": "VENCIDA",
                    "ativa": False
                })
            
            # Se a nova CCT engloba totalmente uma existente (bloquear)
            elif payload.data_inicio <= ex_inicio and payload.data_fim >= ex_fim:
                raise HTTPException(400, f"Conflito total: Esta CCT engloba o período da CCT {ex.get('numero_registro', ex['id'])}")

        # 3. Inserir a nova CCT
        data = repo.inserir_cct(jsonable_encoder(payload.model_dump()))

        registrar_log(
            user_id=user["id"],
            action="create",
            entity=ENTITY_CCT,
            entity_id=str(data["id"]),
            payload=jsonable_encoder(data)
        )
        
        return success(jsonable_encoder(data), "CCT criada com sucesso")
    except HTTPException:
        raise
    except Exception as e:
        if "unique constraint" in str(e).lower():
            raise HTTPException(400, "Já existe uma CCT cadastrada com estes mesmos parâmetros.")
        raise HTTPException(500, f"Erro ao criar CCT: {str(e)}")

# --- ITENS ---

def listar_itens_service(cct_id: str, user):
    try:
        data = repo.listar_itens(cct_id)
        return success(jsonable_encoder(data))
    except Exception as e:
        raise HTTPException(500, f"Erro ao listar itens da CCT: {str(e)}")

def adicionar_item_service(cct_id: str, payload, user):
    cct = repo.buscar_cct_por_id(cct_id)
    if not cct:
        raise HTTPException(404, "CCT não encontrada")

    # Validar duplicidade de item
    item_existente = repo.buscar_item_por_codigo(cct_id, payload.codigo_item)
    if item_existente:
        raise HTTPException(400, f"Item {payload.codigo_item} já cadastrado nesta CCT")

    # Validar dependência de base_calculo
    if payload.base_calculo:
        if payload.base_calculo == payload.codigo_item:
            raise HTTPException(400, "Um item não pode ter a si mesmo como base de cálculo")
            
        base = repo.buscar_item_por_codigo(cct_id, payload.base_calculo)
        if not base:
            raise HTTPException(400, f"Base de cálculo '{payload.base_calculo}' não encontrada nesta CCT")
            
        # Ciclo simples: se a base já aponta para o item que estamos criando
        if base.get("base_calculo") == payload.codigo_item:
            raise HTTPException(400, f"Ciclo de dependência detectado: '{payload.base_calculo}' já depende de '{payload.codigo_item}'")

    data_to_insert = jsonable_encoder(payload.model_dump())
    data_to_insert["cct_id"] = str(cct_id)
    
    data = repo.inserir_item(data_to_insert)

    registrar_log(
        user_id=user["id"],
        action="add_item",
        entity=ENTITY_CCT,
        entity_id=str(cct_id),
        payload=jsonable_encoder(data)
    )

    return success(jsonable_encoder(data), "Item adicionado com sucesso")

# --- VALORES ---

def listar_valores_service(cct_id: str, user):
    # Aqui retornamos todos os valores da CCT
    res = repo.listar_valores(cct_id)
    return success(jsonable_encoder(res))

def adicionar_valor_service(cct_id: str, payload, user):
    cct = repo.buscar_cct_por_id(cct_id)
    if not cct:
        raise HTTPException(404, "CCT não encontrada")

    item = repo.buscar_item_por_codigo(cct_id, payload.codigo_item)
    if not item:
        raise HTTPException(400, f"Item {payload.codigo_item} não existe nesta CCT")

    # Validar a existência do cargo selecionado
    from app.repositories import cargos_base_repository
    cargo_existente = cargos_base_repository.buscar_por_id(payload.cargo_base_id)
    if not cargo_existente:
        raise HTTPException(404, f"Cargo com ID {payload.cargo_base_id} não encontrado no catálogo base.")

    # Validar duplicidade
    existente = repo.buscar_valor_especifico(cct_id, str(payload.cargo_base_id), payload.codigo_item)
    if existente:
        raise HTTPException(400, f"Já existe um valor definido para este cargo no item '{payload.codigo_item}'")

    # Validar intervalos baseado no tipo do item
    tipo = item.get("tipo_calculo")
    valor = payload.valor

    if tipo == "PERCENTUAL":
        if valor < 0 or valor > 100:
            raise HTTPException(400, "Para itens PERCENTUAL, o valor deve estar entre 0 e 100")
    elif tipo == "MULTIPLICADOR":
        if valor <= 0:
            raise HTTPException(400, "Para itens MULTIPLICADOR, o valor deve ser maior que zero (ex: 1.2)")
    elif tipo in ["FIXO", "DIARIO"]:
        if valor < 0:
            raise HTTPException(400, f"Para itens {tipo}, o valor não pode ser negativo")

    data_to_insert = jsonable_encoder(payload.model_dump())
    data_to_insert["cct_id"] = str(cct_id)

    data = repo.inserir_valor(data_to_insert)

    registrar_log(
        user_id=user["id"],
        action="add_valor",
        entity=ENTITY_CCT,
        entity_id=str(cct_id),
        payload=jsonable_encoder(data)
    )

    return success(jsonable_encoder(data), "Valor por cargo adicionado")
