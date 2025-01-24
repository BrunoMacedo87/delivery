from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas
from .auth import get_current_user
import os
import shutil
from pathlib import Path

router = APIRouter()

# Criar diretório para logos se não existir
UPLOAD_DIR = Path("uploads/logos")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/", response_model=schemas.Empresa)
def create_empresa(
    empresa: schemas.EmpresaCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Verifica se o CNPJ já existe
    db_empresa = db.query(models.Empresa).filter(models.Empresa.cnpj == empresa.cnpj).first()
    if db_empresa:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CNPJ já cadastrado"
        )

    # Verifica se o slug já existe
    db_empresa = db.query(models.Empresa).filter(models.Empresa.slug == empresa.slug).first()
    if db_empresa:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slug já está em uso"
        )

    # Cria a empresa vinculada ao usuário atual
    db_empresa = models.Empresa(
        **empresa.model_dump(),
        usuario_id=current_user.id
    )
    db.add(db_empresa)
    db.commit()
    db.refresh(db_empresa)
    return db_empresa

@router.get("/", response_model=List[schemas.Empresa])
def read_empresas(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    empresas = db.query(models.Empresa)\
        .filter(models.Empresa.usuario_id == current_user.id)\
        .offset(skip)\
        .limit(limit)\
        .all()
    return empresas

@router.get("/{empresa_id}", response_model=schemas.Empresa)
def read_empresa(
    empresa_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    empresa = db.query(models.Empresa)\
        .filter(models.Empresa.id == empresa_id)\
        .filter(models.Empresa.usuario_id == current_user.id)\
        .first()
    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    return empresa

@router.put("/{empresa_id}", response_model=schemas.Empresa)
def update_empresa(
    empresa_id: int,
    empresa: schemas.EmpresaCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Busca a empresa existente
    db_empresa = db.query(models.Empresa)\
        .filter(models.Empresa.id == empresa_id)\
        .filter(models.Empresa.usuario_id == current_user.id)\
        .first()
    
    if not db_empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )

    # Verifica se o CNPJ já existe (exceto para a própria empresa)
    cnpj_exists = db.query(models.Empresa)\
        .filter(models.Empresa.cnpj == empresa.cnpj)\
        .filter(models.Empresa.id != empresa_id)\
        .first()
    if cnpj_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CNPJ já cadastrado"
        )

    # Verifica se o slug já existe (exceto para a própria empresa)
    slug_exists = db.query(models.Empresa)\
        .filter(models.Empresa.slug == empresa.slug)\
        .filter(models.Empresa.id != empresa_id)\
        .first()
    if slug_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slug já está em uso"
        )

    # Atualiza os campos da empresa
    for field, value in empresa.model_dump().items():
        setattr(db_empresa, field, value)

    db.commit()
    db.refresh(db_empresa)
    return db_empresa

@router.post("/{empresa_id}/logo")
async def upload_logo(
    empresa_id: int,
    logo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Verifica se a empresa existe e pertence ao usuário
    empresa = db.query(models.Empresa)\
        .filter(models.Empresa.id == empresa_id)\
        .filter(models.Empresa.usuario_id == current_user.id)\
        .first()
    
    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    # Verifica se o arquivo é uma imagem
    if not logo.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Arquivo deve ser uma imagem"
        )
    
    # Cria o nome do arquivo usando o slug da empresa
    file_extension = logo.filename.split(".")[-1]
    logo_filename = f"{empresa.slug}.{file_extension}"
    logo_path = UPLOAD_DIR / logo_filename
    
    # Salva o arquivo
    with logo_path.open("wb") as buffer:
        shutil.copyfileobj(logo.file, buffer)
    
    # Atualiza o caminho da logo no banco
    empresa.logo_url = f"/uploads/logos/{logo_filename}"
    db.commit()
    
    return {"message": "Logo atualizada com sucesso", "logo_url": empresa.logo_url}

@router.delete("/{empresa_id}")
def delete_empresa(
    empresa_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    empresa = db.query(models.Empresa)\
        .filter(models.Empresa.id == empresa_id)\
        .filter(models.Empresa.usuario_id == current_user.id)\
        .first()
    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    db.delete(empresa)
    db.commit()
    return {"message": "Empresa excluída com sucesso"}
