from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EmpresaBase(BaseModel):
    nome: str
    dominio: str
    descricao: Optional[str] = None
    logo_url: Optional[str] = None
    cor_primaria: Optional[str] = "#1976d2"
    cor_secundaria: Optional[str] = "#dc004e"
    telefone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    endereco: Optional[str] = None
    modelo_template: Optional[int] = 1

class EmpresaCreate(EmpresaBase):
    pass

class Empresa(EmpresaBase):
    id: int
    usuario_id: int
    ativo: bool
    data_criacao: datetime
    data_atualizacao: datetime

    class Config:
        orm_mode = True
