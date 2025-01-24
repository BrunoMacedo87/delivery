from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, DateTime, Enum, Float
from sqlalchemy.orm import relationship
from database import Base
import enum
from datetime import datetime

class StatusPedido(str, enum.Enum):
    PENDENTE = "PENDENTE"
    CONFIRMADO = "CONFIRMADO"
    EM_PREPARO = "EM_PREPARO"
    PRONTO = "PRONTO"
    ENTREGUE = "ENTREGUE"
    CANCELADO = "CANCELADO"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    empresas = relationship("Empresa", back_populates="usuario")

class Empresa(Base):
    __tablename__ = "empresas"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    slug = Column(String, unique=True, index=True)
    cnpj = Column(String, unique=True)
    endereco = Column(String)
    cidade = Column(String)
    estado = Column(String)
    cep = Column(String)
    telefone = Column(String)
    logo_url = Column(String, nullable=True)
    usuario_id = Column(Integer, ForeignKey("users.id"))
    usuario = relationship("User", back_populates="empresas")
    produtos = relationship("Produto", back_populates="empresa")
    pedidos = relationship("Pedido", back_populates="empresa")
    data_criacao = Column(DateTime, default=datetime.utcnow)
    ativo = Column(Boolean, default=True)

class Produto(Base):
    __tablename__ = "produtos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    descricao = Column(String)
    preco = Column(Float)
    empresa_id = Column(Integer, ForeignKey("empresas.id"))
    empresa = relationship("Empresa", back_populates="produtos")
    pedido_items = relationship("ItemPedido", back_populates="produto")
    ativo = Column(Boolean, default=True)
    data_criacao = Column(DateTime, default=datetime.utcnow)
    data_atualizacao = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Pedido(Base):
    __tablename__ = "pedidos"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(Enum(StatusPedido), default=StatusPedido.PENDENTE)
    data_criacao = Column(DateTime, default=datetime.utcnow)
    empresa_id = Column(Integer, ForeignKey("empresas.id"))
    empresa = relationship("Empresa", back_populates="pedidos")
    items = relationship("ItemPedido", back_populates="pedido")
    valor_total = Column(Float, default=0.0)

class ItemPedido(Base):
    __tablename__ = "pedido_items"

    id = Column(Integer, primary_key=True, index=True)
    quantidade = Column(Integer)
    preco_unitario = Column(Float)
    pedido_id = Column(Integer, ForeignKey("pedidos.id"))
    produto_id = Column(Integer, ForeignKey("produtos.id"))
    pedido = relationship("Pedido", back_populates="items")
    produto = relationship("Produto", back_populates="pedido_items")
