from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
import time

from app.database.supabase import supabase


router = APIRouter(
    prefix="/contratos",
    tags=["Contratos"]
)

BASE_URL = "https://contratos.comprasnet.gov.br/api"

# ===============================
# CACHE EM MEMÓRIA
# ===============================

cache_contratos: dict = {}
cache_time: dict = {}
CACHE_TTL = 3600


# ===============================
# MODELO DE DADOS
# ===============================


# ===============================
# UTILIDADES
# ===============================

def converter_valor(valor):

    if not valor:
        return 0.0

    try:
        return float(str(valor).replace(".", "").replace(",", "."))
    except Exception:
        return 0.0


# ===============================
# LISTAR CONTRATOS DA API
# ===============================

@router.get("/api")
def listar_contratos_api(ug: str = "290002"):

    agora = time.time()

    # cache
    if ug in cache_contratos and (agora - cache_time[ug]) < CACHE_TTL:
        return cache_contratos[ug]

    url = f"{BASE_URL}/contrato/ug/{ug}"

    r = requests.get(url)

    if r.status_code != 200:
        return []

    dados = r.json()

    contratos_formatados = []

    for c in dados:

        valor = c.get("valor_global", "0").replace(".", "").replace(",", ".")

        contratos_formatados.append({
            "id_api": c["id"],
            "numero": c["numero"],
            "fornecedor_nome": c["fornecedor"]["nome"],
            "objeto": c["objeto"],
            "vigencia_inicio": c["vigencia_inicio"],
            "vigencia_fim": c["vigencia_fim"],
            "valor_global": float(valor),
            "situacao": c["situacao"]
        })

    # salva cache
    cache_contratos[ug] = contratos_formatados
    cache_time[ug] = agora

    return contratos_formatados


# ===============================
# BUSCAR ITENS DO CONTRATO
# ===============================

@router.get("/api/{id_api}/itens")
def buscar_itens_contrato(id_api: int):

    url = f"{BASE_URL}/contrato/{id_api}/itens"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
    except requests.RequestException:
        raise HTTPException(status_code=502, detail="Erro ao consultar itens do contrato")

    return response.json()


# ===============================
# CRIAR CONTRATO NO BANCO
# ===============================

@router.post("/")
def criar_contrato(payload: dict):

    id_api = payload.get("id_api")

    if not id_api:
        raise HTTPException(400, "id_api é obrigatório")

    # =========================
    # BUSCAR CONTRATO NA API
    # =========================

    url = f"{BASE_URL}/contrato/id/{id_api}"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        contrato = response.json()

        # API às vezes retorna lista
        if isinstance(contrato, list):
            if not contrato:
                raise HTTPException(404, "Contrato não encontrado")
            contrato = contrato[0]

    except requests.RequestException as e:
        print("Erro API contrato:", e)
        raise HTTPException(502, "Erro ao buscar contrato na API")

    numero = contrato.get("numero")

    # =========================
    # VERIFICA DUPLICIDADE
    # =========================

    existe = supabase.table("contratos") \
        .select("id") \
        .eq("numero", numero) \
        .execute().data

    if existe:
        raise HTTPException(409, "Contrato já cadastrado")

    # =========================
    # NORMALIZAÇÃO DOS DADOS 🔥
    # =========================

    fornecedor_nome = (
        contrato.get("fornecedor_nome")
        or contrato.get("fornecedor", {}).get("nome")
    )

    fornecedor_cnpj = (
        contrato.get("fonecedor_cnpj_cpf_idgener")
        or contrato.get("fornecedor_cnpj")
        or contrato.get("fornecedor", {}).get("cnpj_cpf_idgener")
    )

    orgao_nome = (
        contrato.get("orgao_nome")
        or contrato.get("contratante", {}).get("orgao", {}).get("nome")
    )

    ug_codigo = (
        contrato.get("unidade_codigo")
        or contrato.get("contratante", {}).get("orgao", {})
            .get("unidade_gestora", {})
            .get("codigo")
    )

    amparo_legal = (
        contrato.get("amparo_legal")
        or contrato.get("fundamento_legal")
    )

    # =========================
    # MONTAR INSERT
    # =========================

    dados_insert = {

        "id_api": contrato.get("id"),
        "numero": numero,

        "ug_codigo": ug_codigo,
        "orgao_nome": orgao_nome,

        "fornecedor_nome": fornecedor_nome,
        "fornecedor_cnpj": fornecedor_cnpj,

        "objeto": contrato.get("objeto"),
        "processo": contrato.get("processo"),
        "modalidade": contrato.get("modalidade"),
        "amparo_legal": amparo_legal,

        "vigencia_inicio": contrato.get("vigencia_inicio"),
        "vigencia_fim": contrato.get("vigencia_fim"),

        "valor_inicial": converter_valor(contrato.get("valor_inicial")),
        "valor_global": converter_valor(contrato.get("valor_global")),
        "valor_parcela": converter_valor(contrato.get("valor_parcela")),
        "num_parcelas": contrato.get("num_parcelas"),

        "situacao": contrato.get("situacao"),
        "status": "Ativo",

        "dados_api_snapshot": contrato
    }

    # =========================
    # SALVAR CONTRATO
    # =========================

    try:

        res = supabase.table("contratos") \
            .insert(dados_insert) \
            .execute()

        contrato_id = res.data[0]["id"]

    except Exception as e:
        print("Erro ao salvar contrato:", e)
        raise HTTPException(500, "Erro ao salvar contrato")

    # =========================
    # IMPORTAR CARGOS 🔥
    # =========================

    url_itens = f"{BASE_URL}/contrato/{id_api}/itens"

    try:
        response = requests.get(url_itens, timeout=10)
        response.raise_for_status()
        itens = response.json()

    except requests.RequestException as e:
        print("Erro API itens:", e)
        raise HTTPException(502, "Erro ao buscar itens do contrato")

@router.post("/")
def criar_contrato(payload: dict):

    id_api = payload.get("id_api")

    if not id_api:
        raise HTTPException(400, "id_api é obrigatório")

    # =========================
    # BUSCAR CONTRATO NA API
    # =========================

    url = f"{BASE_URL}/contrato/id/{id_api}"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        contrato = response.json()

        # API às vezes retorna lista
        if isinstance(contrato, list):
            if not contrato:
                raise HTTPException(404, "Contrato não encontrado")
            contrato = contrato[0]

    except requests.RequestException as e:
        print("Erro API contrato:", e)
        raise HTTPException(502, "Erro ao buscar contrato na API")

    numero = contrato.get("numero")

    # =========================
    # VERIFICA DUPLICIDADE
    # =========================

    existe = supabase.table("contratos") \
        .select("id") \
        .eq("numero", numero) \
        .execute().data

    if existe:
        raise HTTPException(409, "Contrato já cadastrado")

    # =========================
    # NORMALIZAÇÃO DOS DADOS 🔥
    # =========================

    fornecedor_nome = (
        contrato.get("fornecedor_nome")
        or contrato.get("fornecedor", {}).get("nome")
    )

    fornecedor_cnpj = (
        contrato.get("fonecedor_cnpj_cpf_idgener")
        or contrato.get("fornecedor_cnpj")
        or contrato.get("fornecedor", {}).get("cnpj_cpf_idgener")
    )

    orgao_nome = (
        contrato.get("orgao_nome")
        or contrato.get("contratante", {}).get("orgao", {}).get("nome")
    )

    ug_codigo = (
        contrato.get("unidade_codigo")
        or contrato.get("contratante", {}).get("orgao", {})
            .get("unidade_gestora", {})
            .get("codigo")
    )

    amparo_legal = (
        contrato.get("amparo_legal")
        or contrato.get("fundamento_legal")
    )

    # =========================
    # MONTAR INSERT
    # =========================

    dados_insert = {

        "id_api": contrato.get("id"),
        "numero": numero,

        "ug_codigo": ug_codigo,
        "orgao_nome": orgao_nome,

        "fornecedor_nome": fornecedor_nome,
        "fornecedor_cnpj": fornecedor_cnpj,

        "objeto": contrato.get("objeto"),
        "processo": contrato.get("processo"),
        "modalidade": contrato.get("modalidade"),
        "amparo_legal": amparo_legal,

        "vigencia_inicio": contrato.get("vigencia_inicio"),
        "vigencia_fim": contrato.get("vigencia_fim"),

        "valor_inicial": converter_valor(contrato.get("valor_inicial")),
        "valor_global": converter_valor(contrato.get("valor_global")),
        "valor_parcela": converter_valor(contrato.get("valor_parcela")),
        "num_parcelas": contrato.get("num_parcelas"),

        "situacao": contrato.get("situacao"),
        "status": "Ativo",

        "dados_api_snapshot": contrato
    }

    # =========================
    # SALVAR CONTRATO
    # =========================

    try:

        res = supabase.table("contratos") \
            .insert(dados_insert) \
            .execute()

        contrato_id = res.data[0]["id"]

    except Exception as e:
        print("Erro ao salvar contrato:", e)
        raise HTTPException(500, "Erro ao salvar contrato")

    # =========================
    # IMPORTAR CARGOS 🔥
    # =========================

    url_itens = f"{BASE_URL}/contrato/{id_api}/itens"

    try:
        response = requests.get(url_itens, timeout=10)
        response.raise_for_status()
        itens = response.json()

    except requests.RequestException as e:
        print("Erro API itens:", e)
        raise HTTPException(502, "Erro ao buscar itens do contrato")

    cargos = []

    for item in itens:

        try:

            # NOME
            nome = item.get("descricao_complementar")

            if not nome or not str(nome).strip():
                print("Item sem nome:", item)
                continue

            # VALOR
            valor_raw = item.get("valorunitario", "0")

            valor = float(
                str(valor_raw)
                .replace(".", "")
                .replace(",", ".")
            )

            # QUANTIDADE
            quantidade_raw = item.get("quantidade", 1)

            try:
                quantidade = int(quantidade_raw)
            except:
                quantidade = 1

            cargos.append({
                "contrato_id": contrato_id,
                "nome": nome.strip(),
                "quantidade": quantidade,
                "valor_unitario": valor,
                "status": "ativo"
            })

        except Exception as e:
            print("Erro item:", item, e)

    if cargos:
        supabase.table("cargos").insert(cargos).execute()

    return {
        "status": "ok",
        "cargos_importados": len(cargos)
    }



@router.get("/")
def listar_contratos():

    try:

        res = supabase.table("contratos") \
            .select("*") \
            .order("created_at", desc=True) \
            .execute()

        return res.data

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Erro ao buscar contratos"
        )
    
@router.post("/{contrato_id}/importar-cargos")
def importar_cargos_contrato(contrato_id: str):

    contrato = supabase.table("contratos") \
        .select("id_api") \
        .eq("id", contrato_id) \
        .single() \
        .execute()

    if not contrato.data:
        raise HTTPException(status_code=404, detail="Contrato não encontrado")

    id_api = contrato.data["id_api"]

    url = f"{BASE_URL}/contrato/{id_api}/itens"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
    except requests.RequestException:
        raise HTTPException(status_code=502, detail="Erro ao consultar itens do contrato")

    itens = response.json()

    cargos = []

    for item in itens:

        valor = item.get("valor_unitario", "0")

        if isinstance(valor, str):
            valor = float(valor.replace(".", "").replace(",", "."))
        else:
            valor = float(valor or 0)

        cargos.append({
            "contrato_id": contrato_id,
            "nome": item.get("descricao"),
            "quantidade": item.get("quantidade", 1),
            "valor_unitario": valor,
            "status": "ativo"
        })

    if cargos:
        supabase.table("cargos").insert(cargos).execute()

    return {
        "status": "ok",
        "cargos_importados": len(cargos)
    }

# ===============================
# BUSCAR CONTRATO POR ID
# ===============================

@router.get("/{contrato_id}")
def buscar_contrato(contrato_id: str):

    try:

        res = supabase.table("contratos") \
            .select("*") \
            .eq("id", contrato_id) \
            .single() \
            .execute()

        if not res.data:
            raise HTTPException(
                status_code=404,
                detail="Contrato não encontrado"
            )

        return res.data

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Erro ao buscar contrato"
        )
    
@router.delete("/{contrato_id}")
def excluir_contrato(contrato_id: str):

    try:

        # =========================
        # EXCLUI CARGOS RELACIONADOS
        # =========================

        supabase.table("cargos") \
            .delete() \
            .eq("contrato_id", contrato_id) \
            .execute()

        # =========================
        # EXCLUI CONTRATO
        # =========================

        res = supabase.table("contratos") \
            .delete() \
            .eq("id", contrato_id) \
            .execute()

        if not res.data:
            raise HTTPException(
                status_code=404,
                detail="Contrato não encontrado"
            )

        return {"status": "ok"}

    except Exception as e:
        print("Erro ao excluir contrato:", e)
        raise HTTPException(
            status_code=500,
            detail="Erro ao excluir contrato"
        )