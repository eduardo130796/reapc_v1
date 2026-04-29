from fastapi import HTTPException
from app.core.response import success
from app.repositories import pcfp_repository as repo
from app.repositories import cargos_repository, contratos_repository, cct_repository
from app.calculators.pcfp_calculator import calcular_pcfp, calcular_pcfp_simulacao
from app.services.audit_service import registrar_log
from fastapi.encoders import jsonable_encoder

ENTITY = "pcfp"

def obter_pcfp_por_cargo_service(cargo_id: str):
    pcfp = repo.buscar_por_cargo_id(cargo_id)
    if not pcfp:
        return success(None)  # Mudado para retornar null/None explicitamente
    return success(pcfp)

def salvar_estrutura_service(cargo_id: str, estrutura: dict):
    data = repo.salvar_pcfp(cargo_id, estrutura)
    return success(data, "Estrutura salva com sucesso")

def aplicar_modelo_service(cargo_id: str, modelo_id: str, user):
    from app.repositories import modelos_repository
    
    pcfp = repo.buscar_por_cargo_id(cargo_id)
    
    # NÃO sobrescrever se já existir estrutura (mesmo que não esteja bloqueada)
    if pcfp and pcfp.get("estrutura") and pcfp.get("estrutura").get("modulos"):
       raise HTTPException(400, "Este cargo já possui uma estrutura definida. Se deseja mudar, remova a atual primeiro.")

    if pcfp and pcfp.get("bloqueado"):
        raise HTTPException(400, "Este cargo já possui uma planilha bloqueada.")

    modelo = modelos_repository.buscar_por_id(modelo_id)
    if not modelo:
        raise HTTPException(404, "Modelo não encontrado")

    estrutura = modelo.get("estrutura", {})
    data = repo.salvar_pcfp(cargo_id, estrutura)

    registrar_log(
        user_id=user["id"],
        action="apply_model",
        entity=ENTITY,
        entity_id=cargo_id,
        payload={"modelo_id": modelo_id}
    )

    return success(data, "Modelo aplicado")

def calcular_pcfp_service(payload: dict, user):
    cargo_id = payload.get("cargo_id")
    cct_id = payload.get("cct_id")            # Selecionada pelo usuário na tela PCFP
    parametros_frontend = payload.get("parametros", {})

    # 1. Buscar a estrutura da planilha para este cargo
    pcfp = repo.buscar_por_cargo_id(cargo_id)
    if not pcfp or not pcfp.get("estrutura"):
        raise HTTPException(400, "Estrutura da PCFP não definida para este cargo. Aplique um modelo primeiro.")

    estrutura = pcfp["estrutura"]

    # 2. Buscar cargo para obter o cargo_base_id (tipo de cargo para valores CCT)
    cargo = cargos_repository.buscar_por_id(cargo_id)
    if not cargo:
        raise HTTPException(404, "Cargo não encontrado")

    cargo_base_id = cargo.get("cargo_id")  # FK -> cargos_base (tipo de cargo)

    # 3. Buscar os valores da CCT para este tipo de cargo (se CCT foi selecionada)
    parametros_finais = {}
    if cct_id and cargo_base_id:
        valores_cct = cct_repository.listar_valores_por_cargo(cct_id, cargo_base_id)
        for v in valores_cct:
            parametros_finais[v["codigo_item"]] = float(v["valor"])

    # 4. Mesclar: parâmetros do usuário têm prioridade sobre valores da CCT
    parametros_finais.update(parametros_frontend)

    # 5. Executar o cálculo
    try:
        resultados = calcular_pcfp(estrutura, parametros_finais)
        return success({
            "resultados": resultados,
            "parametros_utilizados": parametros_finais
        })
    except Exception as e:
        raise HTTPException(400, f"Erro no motor de cálculo: {str(e)}")


def salvar_versao_service(payload: dict, user):
    cargo_id = payload.get("cargo_id")
    
    # Buscar última versão para incrementar
    ultima = repo.buscar_ultima_versao(cargo_id)
    prox_versao = (ultima["numero_versao"] + 1) if ultima else 1

    data_versao = {
        "cargo_id": cargo_id,
        "numero_versao": prox_versao,
        "estrutura": payload.get("estrutura"),
        "parametros": payload.get("parametros"),
        "resultados": payload.get("resultados"),
        "total_unitario": payload.get("total_unitario"),
        "tipo_versao": payload.get("tipo_versao"),
        "tipo_evento": payload.get("tipo_evento"),
        "justificativa": payload.get("justificativa"),
        "vigencia_inicio": payload.get("vigencia_inicio"),
        "vigencia_fim": payload.get("vigencia_fim"),
        "observacao": payload.get("observacao"),
        "criado_por": user["id"]
    }

    # Salvar a versão
    nova_versao = repo.salvar_versao(jsonable_encoder(data_versao))

    # 🔥 SINCRONIZAÇÃO: Atualizar valor unitário do cargo na tabela de cargos
    # O valor do cargo deve sempre refletir a última versão salva da PCFP
    if payload.get("total_unitario"):
        cargos_repository.atualizar(cargo_id, {"valor_unitario": float(payload["total_unitario"])})

    # Log da operação
    registrar_log(
        user_id=user["id"],
        action="create_version",
        entity="versoes_repactuacao",
        entity_id=nova_versao["id"],
        payload={"versao": prox_versao}
    )

    return success(nova_versao, f"Versão {prox_versao} salva com sucesso")

def simular_estrutura_service(estrutura, parametros):
    resultado = calcular_pcfp_simulacao(
        estrutura=estrutura,
        parametros=parametros
    )
    return resultado