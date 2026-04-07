from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

class PCFPInput(BaseModel):
    cargo_id: str
    estrutura: Dict[str, Any]
    parametros: Dict[str, float]

class SalvarEstruturaSchema(BaseModel):
    cargo_id: str
    estrutura: Dict[str, Any]

class SimularEstruturaSchema(BaseModel):
    estrutura: Dict[str, Any]
    parametros: Dict[str, float] = {}