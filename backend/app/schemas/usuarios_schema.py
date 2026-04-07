from pydantic import BaseModel, EmailStr
from typing import Optional


class UsuarioCreate(BaseModel):
    email: EmailStr
    password: str
    role_id: Optional[str]


class UsuarioResponse(BaseModel):
    id: str
    email: EmailStr
    role_id: Optional[str]


class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    password: Optional[str] = None