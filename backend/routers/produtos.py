from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import sys
import os

# Adiciona o diretório pai ao PYTHONPATH
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db
from schemas import ProdutoCreate, Produto
from models import Produto as ProdutoModel
from auth import get_current_user

router = APIRouter(prefix="/produtos", tags=["produtos"])

@router.post("/", response_model=Produto)
async def criar_produto(
    produto: ProdutoCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem criar produtos"
        )
    
    db_produto = ProdutoModel(**produto.dict())
    db.add(db_produto)
    db.commit()
    db.refresh(db_produto)
    return db_produto

@router.get("/", response_model=List[Produto])
async def listar_produtos(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    produtos = db.query(ProdutoModel).offset(skip).limit(limit).all()
    return produtos

@router.get("/{produto_id}", response_model=Produto)
async def obter_produto(produto_id: int, db: Session = Depends(get_db)):
    produto = db.query(ProdutoModel).filter(ProdutoModel.id == produto_id).first()
    if produto is None:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return produto

@router.put("/{produto_id}", response_model=Produto)
async def atualizar_produto(
    produto_id: int,
    produto: ProdutoCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem atualizar produtos"
        )
    
    db_produto = db.query(ProdutoModel).filter(ProdutoModel.id == produto_id).first()
    if db_produto is None:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    
    for key, value in produto.dict().items():
        setattr(db_produto, key, value)
    
    db.commit()
    db.refresh(db_produto)
    return db_produto

@router.delete("/{produto_id}")
async def deletar_produto(
    produto_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem deletar produtos"
        )
    
    db_produto = db.query(ProdutoModel).filter(ProdutoModel.id == produto_id).first()
    if db_produto is None:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    
    db.delete(db_produto)
    db.commit()
    return {"message": "Produto deletado com sucesso"}
