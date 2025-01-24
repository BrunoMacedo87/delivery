from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..schemas import Pedido, PedidoCreate
from ..models import Pedido as PedidoModel, ItemPedido, Produto
from ..auth import get_current_user
from ..whatsapp import EvolutionWhatsAppAPI

router = APIRouter(prefix="/pedidos", tags=["pedidos"])
whatsapp = EvolutionWhatsAppAPI()

@router.post("/", response_model=Pedido)
async def criar_pedido(
    pedido: PedidoCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Verifica estoque e calcula valor total
    valor_total = 0
    itens_pedido = []
    
    for item in pedido.itens:
        produto = db.query(Produto).filter(Produto.id == item.produto_id).first()
        if not produto:
            raise HTTPException(status_code=404, detail=f"Produto {item.produto_id} não encontrado")
        
        if produto.quantidade_estoque < item.quantidade:
            raise HTTPException(
                status_code=400,
                detail=f"Quantidade insuficiente em estoque para o produto {produto.nome}"
            )
        
        valor_item = produto.preco * item.quantidade
        valor_total += valor_item
        
        # Atualiza estoque
        produto.quantidade_estoque -= item.quantidade
        
        itens_pedido.append(ItemPedido(
            produto_id=item.produto_id,
            quantidade=item.quantidade,
            preco_unitario=produto.preco
        ))
    
    # Cria o pedido
    db_pedido = PedidoModel(
        usuario_id=current_user.id,
        valor_total=valor_total,
        itens=itens_pedido
    )
    
    db.add(db_pedido)
    db.commit()
    db.refresh(db_pedido)
    
    # Envia confirmação via WhatsApp
    try:
        await whatsapp.enviar_confirmacao_pedido(
            current_user.telefone,
            db_pedido.id,
            valor_total
        )
    except Exception as e:
        print(f"Erro ao enviar mensagem WhatsApp: {e}")
    
    return db_pedido

@router.get("/", response_model=List[Pedido])
async def listar_pedidos(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.is_admin:
        pedidos = db.query(PedidoModel).offset(skip).limit(limit).all()
    else:
        pedidos = db.query(PedidoModel).filter(
            PedidoModel.usuario_id == current_user.id
        ).offset(skip).limit(limit).all()
    return pedidos

@router.get("/{pedido_id}", response_model=Pedido)
async def obter_pedido(
    pedido_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    pedido = db.query(PedidoModel).filter(PedidoModel.id == pedido_id).first()
    if pedido is None:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    if not current_user.is_admin and pedido.usuario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para acessar este pedido"
        )
    
    return pedido

@router.put("/{pedido_id}/status", response_model=Pedido)
async def atualizar_status_pedido(
    pedido_id: int,
    novo_status: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem atualizar status de pedidos"
        )
    
    pedido = db.query(PedidoModel).filter(PedidoModel.id == pedido_id).first()
    if pedido is None:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    pedido.status = novo_status
    db.commit()
    db.refresh(pedido)
    
    # Notifica cliente via WhatsApp
    try:
        usuario = pedido.usuario
        await whatsapp.enviar_atualizacao_status(
            usuario.telefone,
            pedido.id,
            novo_status
        )
    except Exception as e:
        print(f"Erro ao enviar mensagem WhatsApp: {e}")
    
    return pedido
