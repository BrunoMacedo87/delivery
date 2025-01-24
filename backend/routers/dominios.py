from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict
from ..database import get_db
from ..auth import get_current_user
import dns.resolver
import subprocess
import os
import asyncio
from datetime import datetime

router = APIRouter(prefix="/dominios", tags=["dominios"])

async def verificar_dns(dominio: str, ip_servidor: str) -> Dict:
    """Verifica se o domínio está apontando corretamente para o servidor"""
    try:
        # Verifica registro A
        answers = dns.resolver.resolve(dominio, 'A')
        ips_encontrados = [str(rdata) for rdata in answers]
        
        # Verifica se o IP do servidor está nos registros
        dns_ok = ip_servidor in ips_encontrados
        
        return {
            "status": "ok" if dns_ok else "erro",
            "message": "DNS configurado corretamente" if dns_ok else "DNS não está apontando para o servidor",
            "detalhes": {
                "ips_encontrados": ips_encontrados,
                "ip_esperado": ip_servidor
            }
        }
    except Exception as e:
        return {
            "status": "erro",
            "message": f"Erro ao verificar DNS: {str(e)}",
            "detalhes": None
        }

async def gerar_ssl_background(dominio: str, email_admin: str):
    """Executa a geração do SSL em background"""
    try:
        # Caminho para o script
        script_path = os.path.join(os.getcwd(), 'scripts', 'ssl-cert-manager.sh')
        
        # Executa o script
        process = await asyncio.create_subprocess_exec(
            script_path,
            'generate',
            dominio,
            email_admin,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await process.communicate()
        
        if process.returncode != 0:
            raise Exception(f"Erro ao gerar SSL: {stderr.decode()}")
        
        # Atualiza o status do SSL no banco de dados
        # Implementar atualização no banco aqui
        
    except Exception as e:
        print(f"Erro ao gerar SSL para {dominio}: {str(e)}")
        # Implementar log de erro aqui

@router.post("/verificar")
async def verificar_dominio(
    dominio: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Verifica se um domínio está configurado corretamente"""
    # IP do seu servidor (deve vir de variável de ambiente em produção)
    IP_SERVIDOR = os.getenv("SERVER_IP")
    
    if not IP_SERVIDOR:
        raise HTTPException(
            status_code=500,
            detail="IP do servidor não configurado"
        )
    
    # Verifica se o domínio pertence ao usuário
    empresa = db.query(EmpresaModel).filter(
        EmpresaModel.usuario_id == current_user.id,
        EmpresaModel.dominio == dominio
    ).first()
    
    if not empresa:
        raise HTTPException(
            status_code=403,
            detail="Domínio não pertence ao usuário"
        )
    
    # Verifica DNS
    resultado = await verificar_dns(dominio, IP_SERVIDOR)
    
    return resultado

@router.post("/gerar-ssl")
async def gerar_ssl(
    dominio: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Inicia o processo de geração de SSL para um domínio"""
    # Verifica se o domínio pertence ao usuário
    empresa = db.query(EmpresaModel).filter(
        EmpresaModel.usuario_id == current_user.id,
        EmpresaModel.dominio == dominio
    ).first()
    
    if not empresa:
        raise HTTPException(
            status_code=403,
            detail="Domínio não pertence ao usuário"
        )
    
    # Verifica DNS primeiro
    resultado_dns = await verificar_dns(dominio, os.getenv("SERVER_IP"))
    
    if resultado_dns["status"] != "ok":
        raise HTTPException(
            status_code=400,
            detail=resultado_dns["message"]
        )
    
    # Inicia geração do SSL em background
    email_admin = os.getenv("ADMIN_EMAIL", "admin@seu-sistema.com")
    background_tasks.add_task(gerar_ssl_background, dominio, email_admin)
    
    # Atualiza status na empresa
    empresa.ssl_status = "gerando"
    empresa.ssl_ultima_atualizacao = datetime.utcnow()
    db.commit()
    
    return {
        "status": "ok",
        "message": "Geração de SSL iniciada em background",
        "dominio": dominio
    }

@router.get("/status-ssl/{dominio}")
async def status_ssl(
    dominio: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Retorna o status atual do SSL de um domínio"""
    empresa = db.query(EmpresaModel).filter(
        EmpresaModel.usuario_id == current_user.id,
        EmpresaModel.dominio == dominio
    ).first()
    
    if not empresa:
        raise HTTPException(
            status_code=403,
            detail="Domínio não pertence ao usuário"
        )
    
    return {
        "status": empresa.ssl_status,
        "ultima_atualizacao": empresa.ssl_ultima_atualizacao,
        "dominio": dominio
    }
