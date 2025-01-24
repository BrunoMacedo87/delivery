from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import Usuario, UsuarioCreate
from ..models import Usuario as UsuarioModel
from ..auth import (
    get_senha_hash,
    autenticar_usuario,
    criar_token_acesso,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from datetime import timedelta

router = APIRouter(tags=["autenticação"])

@router.post("/registrar", response_model=Usuario)
async def registrar_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    db_usuario = db.query(UsuarioModel).filter(UsuarioModel.email == usuario.email).first()
    if db_usuario:
        raise HTTPException(
            status_code=400,
            detail="Email já registrado"
        )
    
    senha_hash = get_senha_hash(usuario.senha)
    db_usuario = UsuarioModel(
        email=usuario.email,
        senha_hash=senha_hash,
        nome=usuario.nome,
        telefone=usuario.telefone
    )
    
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

@router.post("/token")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    usuario = autenticar_usuario(db, form_data.username, form_data.password)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = criar_token_acesso(
        data={"sub": usuario.email},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": usuario.id,
            "nome": usuario.nome,
            "email": usuario.email,
            "is_admin": usuario.is_admin
        }
    }
