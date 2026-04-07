from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

class RepactuacaoCreateSchema(BaseModel):
    cargo_id: str
    estrutura: Dict[str, Any]
    parametros: Dict[str, float]
    resultados: Dict[str, float]
    total_unitario: float
    tipo_versao: str # Ex: "V2 CCT", "V3 IPCA"
    tipo_evento: str # "CCT" ou "IPCA"
    justificativa: str
    data_referencia: Optional[str] # Data do índice IPCA ou CCT
    vigencia_inicio: Optional[str] # Fato gerador
    vigencia_fim: Optional[str]
    observacao: Optional[str]
