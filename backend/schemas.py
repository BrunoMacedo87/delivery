from pydantic import BaseModel, EmailStr, constr
from typing import List, Optional
from datetime import datetime
from models import StatusPedido

class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool = True

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class EmpresaBase(BaseModel):
    nome: str
    slug: constr(pattern=r'^[a-z0-9]+(?:-[a-z0-9]+)*$')
    cnpj: constr(pattern=r'^\d{14}$')
    endereco: str
    cidade: str
    estado: constr(pattern=r'^[A-Z]{2}$')
    cep: constr(pattern=r'^\d{8}$')
    telefone: constr(pattern=r'^\d{10,11}$')
    logo_url: Optional[str] = None

class EmpresaCreate(EmpresaBase):
    pass

class Empresa(EmpresaBase):
    id: int
    usuario_id: int
    data_criacao: datetime
    ativo: bool = True

    class Config:
        from_attributes = True

class ProdutoBase(BaseModel):
    nome: str
    descricao: str
    preco: float
    quantidade_estoque: int
    imagem_url: Optional[str] = None

class ProdutoCreate(ProdutoBase):
    pass

class Produto(ProdutoBase):
    id: int
    empresa_id: int
    ativo: bool
    data_criacao: datetime
    data_atualizacao: datetime

    class Config:
        from_attributes = True

class ItemPedidoBase(BaseModel):
    produto_id: int
    quantidade: int
    preco_unitario: float

class ItemPedidoCreate(ItemPedidoBase):
    pass

class ItemPedido(ItemPedidoBase):
    id: int
    pedido_id: int

    class Config:
        from_attributes = True

class PedidoBase(BaseModel):
    valor_total: float

class PedidoCreate(BaseModel):
    itens: List[ItemPedidoCreate]

class Pedido(PedidoBase):
    id: int
    status: StatusPedido
    data_criacao: datetime
    empresa_id: int
    itens: List[ItemPedido]

    class Config:
        from_attributes = True
