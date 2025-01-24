from database import engine, Base
from models import User, Empresa, Produto, Pedido, ItemPedido

def init_db():
    print("Criando tabelas no banco de dados...")
    try:
        Base.metadata.create_all(bind=engine)
        print("Tabelas criadas com sucesso!")
    except Exception as e:
        print(f"Erro ao criar tabelas: {str(e)}")

if __name__ == "__main__":
    init_db()
