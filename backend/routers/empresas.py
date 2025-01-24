from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..schemas.empresa import EmpresaCreate, Empresa
from ..models.empresa import Empresa as EmpresaModel
from ..auth import get_current_user
import re

router = APIRouter(prefix="/empresas", tags=["empresas"])

def validar_dominio(dominio: str) -> bool:
    padrao = r'^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$'
    return bool(re.match(padrao, dominio))

@router.post("/", response_model=Empresa)
async def criar_empresa(
    empresa: EmpresaCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Verifica se o usuário já tem uma empresa
    empresa_existente = db.query(EmpresaModel).filter(
        EmpresaModel.usuario_id == current_user.id
    ).first()
    
    if empresa_existente:
        raise HTTPException(
            status_code=400,
            detail="Usuário já possui uma empresa cadastrada"
        )
    
    # Valida o domínio
    if not validar_dominio(empresa.dominio):
        raise HTTPException(
            status_code=400,
            detail="Domínio inválido"
        )
    
    # Verifica se o domínio já está em uso
    dominio_existente = db.query(EmpresaModel).filter(
        EmpresaModel.dominio == empresa.dominio
    ).first()
    
    if dominio_existente:
        raise HTTPException(
            status_code=400,
            detail="Domínio já está em uso"
        )
    
    db_empresa = EmpresaModel(**empresa.dict(), usuario_id=current_user.id)
    db.add(db_empresa)
    db.commit()
    db.refresh(db_empresa)
    return db_empresa

@router.get("/", response_model=List[Empresa])
async def listar_empresas(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.is_admin:
        empresas = db.query(EmpresaModel).offset(skip).limit(limit).all()
    else:
        empresas = db.query(EmpresaModel).filter(
            EmpresaModel.usuario_id == current_user.id
        ).all()
    return empresas

@router.get("/{dominio}", response_model=Empresa)
async def obter_empresa_por_dominio(dominio: str, db: Session = Depends(get_db)):
    empresa = db.query(EmpresaModel).filter(EmpresaModel.dominio == dominio).first()
    if empresa is None:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    return empresa

@router.put("/{empresa_id}", response_model=Empresa)
async def atualizar_empresa(
    empresa_id: int,
    empresa_update: EmpresaCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_empresa = db.query(EmpresaModel).filter(EmpresaModel.id == empresa_id).first()
    
    if db_empresa is None:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    
    if db_empresa.usuario_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Sem permissão para atualizar esta empresa"
        )
    
    # Verifica se o novo domínio já está em uso (se foi alterado)
    if empresa_update.dominio != db_empresa.dominio:
        dominio_existente = db.query(EmpresaModel).filter(
            EmpresaModel.dominio == empresa_update.dominio
        ).first()
        
        if dominio_existente:
            raise HTTPException(
                status_code=400,
                detail="Domínio já está em uso"
            )
    
    for key, value in empresa_update.dict().items():
        setattr(db_empresa, key, value)
    
    db.commit()
    db.refresh(db_empresa)
    return db_empresa
