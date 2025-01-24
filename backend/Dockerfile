FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Criar diretório de uploads e migrações
RUN mkdir -p uploads/logos migrations

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--reload"]
