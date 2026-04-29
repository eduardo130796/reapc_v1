from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
import uuid

class CCTBase(BaseModel):
    sindicato_id: Optional[uuid.UUID] = None  # Novo padrão
    sindicato_cnpj: str                       # Mantido para compatibilidade
    categoria: str
    cnae: str
    uf: str = Field(..., min_length=2, max_length=2)
    numero_registro: Optional[str] = None
    descricao: Optional[str] = None
    versao: str                               # Mantido para compatibilidade
    data_base: date
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    status: Optional[str] = "PENDENTE"
    ativa: Optional[bool] = True

class CCTCreate(CCTBase):
    pass

class CCTUpdate(BaseModel):
    ativa: Optional[bool]
    status: Optional[str]
    data_fim: Optional[date]

class CCTResponse(CCTBase):
    id: uuid.UUID
    created_at: Optional[datetime] = None
    sindicato: Optional[dict] = None  # Para incluir dados do sindicato no join

    class Config:
        from_attributes = True

# --- ITENS ---

class CCTItemBase(BaseModel):
    codigo_item: str
    tipo_calculo: str # FIXO, PERCENTUAL, DIARIO, MULTIPLICADOR
    base_calculo: Optional[str] = None
    obrigatorio: bool = True
    ordem_calculo: int

class CCTItemCreate(CCTItemBase):
    pass

class CCTItemResponse(CCTItemBase):
    id: uuid.UUID
    cct_id: uuid.UUID

# --- VALORES ---

class CCTValorBase(BaseModel):
    cargo_base_id: uuid.UUID
    codigo_item: str
    valor: float

class CCTValorCreate(CCTValorBase):
    pass

class CCTValorResponse(CCTValorBase):
    id: uuid.UUID
    cct_id: uuid.UUID
    cargo: Optional[dict] = None
    
    class Config:
        from_attributes = True
