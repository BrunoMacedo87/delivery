from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from database import engine, Base
from routers import auth, produtos, pedidos, empresas, estatisticas, dominios

# Cria as tabelas no banco de dados
print("Criando tabelas no banco de dados...")
Base.metadata.create_all(bind=engine)
print("Tabelas criadas com sucesso!")

app = FastAPI(title="Sistema de Vendas Online")

# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especifique os domínios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Criar diretório de uploads se não existir
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
(UPLOAD_DIR / "logos").mkdir(exist_ok=True)

# Montar diretório de uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Incluindo os routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(produtos.router, prefix="/produtos", tags=["produtos"])
app.include_router(pedidos.router, prefix="/pedidos", tags=["pedidos"])
app.include_router(empresas.router, prefix="/empresas", tags=["empresas"])
app.include_router(dominios.router, prefix="/dominios", tags=["dominios"])
app.include_router(estatisticas.router, prefix="/estatisticas", tags=["estatisticas"])

@app.get("/")
async def read_root():
    return {"message": "API do Sistema de Vendas"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
