import requests
from app.core.response import success


def buscar_contratos_api_service(ug: str):
    url = f"https://api.exemplo.com/contratos?ug={ug}"

    response = requests.get(url)

    if response.status_code != 200:
        raise Exception("Erro ao buscar contratos da API")

    data = response.json()

    return success(data)