from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from .models import StatusPedido

class UsuarioBase(BaseModel):
    nome: str
    email: EmailStr
    telefone: str

class UsuarioCreate(UsuarioBase):
    senha: str

class Usuario(UsuarioBase):
    id: int
    is_admin: bool
    data_criacao: datetime

    class Config:
        orm_mode = True

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
    ativo: bool
    data_criacao: datetime
    data_atualizacao: datetime

    class Config:
        orm_mode = True

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
        orm_mode = True

class PedidoBase(BaseModel):
    usuario_id: int
    valor_total: float

class PedidoCreate(PedidoBase):
    itens: List[ItemPedidoCreate]

class Pedido(PedidoBase):
    id: int
    status: StatusPedido
    data_pedido: datetime
    data_atualizacao: datetime
    itens: List[ItemPedido]

    class Config:
        orm_mode = True
