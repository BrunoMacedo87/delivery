from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Empresa(Base):
    __tablename__ = "empresas"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    dominio = Column(String, unique=True, index=True)
    descricao = Column(String)
    logo_url = Column(String)
    cor_primaria = Column(String, default="#1976d2")
    cor_secundaria = Column(String, default="#dc004e")
    telefone = Column(String)
    whatsapp = Column(String)
    email = Column(String)
    endereco = Column(String)
    modelo_template = Column(Integer, default=1)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    ativo = Column(Boolean, default=True)
    data_criacao = Column(DateTime, default=datetime.utcnow)
    data_atualizacao = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="empresa")
    produtos = relationship("Produto", back_populates="empresa")
