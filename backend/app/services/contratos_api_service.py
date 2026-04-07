import requests
from app.core.response import success


# URL real da API governamental – substitua pela URL real
GOV_API_URL = "https://api.portaldatransparencia.gov.br/api-de-dados/contratos"

# Chave de API real (configure no .env do backend se necessário)
# GOV_API_KEY = os.getenv("GOV_API_KEY", "")


def buscar_contratos_api_service(ug: str):
    """
    Busca contratos na API do Portal da Transparência pelo código da UG.
    
    Em desenvolvimento, retorna dados mock se a API externa não estiver disponível.
    """
    try:
        headers = {
            "Accept": "application/json",
            # Adicione seu token aqui se necessário:
            # "chave-api-dados": GOV_API_KEY,
        }
        params = {
            "codigoOrgao": ug,
            "pagina": 1,
        }

        response = requests.get(GOV_API_URL, params=params, headers=headers, timeout=10)

        if response.status_code == 200:
            data = response.json()
            # Normaliza o formato para o padrão interno do sistema
            contratos = [
                {
                    "id_api": str(c.get("id", c.get("numero", ""))),
                    "numero": c.get("numero", ""),
                    "fornecedor_nome": c.get("fornecedor", {}).get("nome", c.get("fornecedor", "")),
                    "objeto": c.get("objeto", ""),
                    "vigencia_inicio": c.get("dataInicioVigencia", c.get("dataInicio", "")),
                    "vigencia_fim": c.get("dataFimVigencia", c.get("dataFim", "")),
                    "valor_global": c.get("valorInicial", c.get("valor", 0)),
                }
                for c in (data if isinstance(data, list) else data.get("data", []))
            ]
            return success(contratos)
        else:
            raise Exception(f"API retornou status {response.status_code}")

    except requests.exceptions.ConnectionError:
        # API externa inacessível — retorna mock para desenvolvimento
        return success(_mock_data(ug), message="Dados simulados (API externa indisponível)")

    except requests.exceptions.Timeout:
        raise Exception("Timeout ao conectar com a API governamental")


def _mock_data(ug: str):
    """Dados de exemplo para testes quando a API real não está disponível."""
    return [
        {
            "id_api": f"{ug}-001",
            "numero": f"CT-{ug}/2024-001",
            "fornecedor_nome": "Empresa ABC Ltda.",
            "objeto": "Prestação de serviços de limpeza e conservação",
            "vigencia_inicio": "2024-01-01",
            "vigencia_fim": "2024-12-31",
            "valor_global": 480000.00,
        },
        {
            "id_api": f"{ug}-002",
            "numero": f"CT-{ug}/2024-002",
            "fornecedor_nome": "Segurança Total S.A.",
            "objeto": "Serviços de vigilância e segurança patrimonial",
            "vigencia_inicio": "2024-03-01",
            "vigencia_fim": "2025-02-28",
            "valor_global": 720000.00,
        },
        {
            "id_api": f"{ug}-003",
            "numero": f"CT-{ug}/2023-015",
            "fornecedor_nome": "TechSoft Sistemas Ltda.",
            "objeto": "Manutenção de sistemas de informação",
            "vigencia_inicio": "2023-07-01",
            "vigencia_fim": "2024-06-30",
            "valor_global": 192000.00,
        },
    ]