from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime

class SindicatoBase(BaseModel):
    cnpj: str
    nome: Optional[str] = None
    uf: Optional[str] = None

class SindicatoCreate(SindicatoBase):
    pass

class SindicatoResponse(SindicatoBase):
    id: uuid.UUID
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
