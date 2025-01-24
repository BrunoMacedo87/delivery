from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from database import get_db
import models
from .auth import get_current_user

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Busca a empresa do usuário
    empresa = db.query(models.Empresa)\
        .filter(models.Empresa.usuario_id == current_user.id)\
        .first()
    
    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    # Total de pedidos
    total_pedidos = db.query(func.count(models.Pedido.id))\
        .filter(models.Pedido.empresa_id == empresa.id)\
        .scalar() or 0
    
    # Total de produtos
    total_produtos = db.query(func.count(models.Produto.id))\
        .filter(models.Produto.empresa_id == empresa.id)\
        .scalar() or 0
    
    # Valor total de vendas
    valor_total_vendas = db.query(func.sum(models.Pedido.valor_total))\
        .filter(models.Pedido.empresa_id == empresa.id)\
        .scalar() or 0
    
    # Ticket médio
    ticket_medio = valor_total_vendas / total_pedidos if total_pedidos > 0 else 0
    
    return {
        "total_pedidos": total_pedidos,
        "total_produtos": total_produtos,
        "valor_total_vendas": float(valor_total_vendas),
        "ticket_medio": float(ticket_medio),
        "empresa": {
            "nome": empresa.nome,
            "cnpj": empresa.cnpj
        }
    }

@router.get("/vendas-por-dia")
async def get_vendas_por_dia(
    dias: int = 7,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Busca a empresa do usuário
    empresa = db.query(models.Empresa)\
        .filter(models.Empresa.usuario_id == current_user.id)\
        .first()
    
    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )
    
    # Data inicial (hoje - dias)
    data_inicial = datetime.now() - timedelta(days=dias)
    
    # Busca vendas por dia
    vendas = db.query(
        func.date(models.Pedido.data_criacao).label('data'),
        func.count(models.Pedido.id).label('total_pedidos'),
        func.sum(models.Pedido.valor_total).label('valor_total')
    )\
    .filter(models.Pedido.empresa_id == empresa.id)\
    .filter(models.Pedido.data_criacao >= data_inicial)\
    .group_by(func.date(models.Pedido.data_criacao))\
    .order_by(func.date(models.Pedido.data_criacao))\
    .all()
    
    # Formata o resultado
    resultado = []
    data_atual = data_inicial
    while data_atual <= datetime.now():
        # Procura os dados do dia
        venda_dia = next(
            (v for v in vendas if v.data.date() == data_atual.date()),
            None
        )
        
        resultado.append({
            "data": data_atual.date().isoformat(),
            "total_pedidos": venda_dia.total_pedidos if venda_dia else 0,
            "valor_total": float(venda_dia.valor_total) if venda_dia else 0
        })
        
        data_atual += timedelta(days=1)
    
    return resultado
