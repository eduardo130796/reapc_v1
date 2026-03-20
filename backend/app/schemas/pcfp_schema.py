from pydantic import BaseModel
from typing import Dict, Any


class PCFPInput(BaseModel):

    estrutura: Dict[str, Any]
    parametros: Dict[str, float]