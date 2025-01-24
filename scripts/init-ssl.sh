#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Função para exibir mensagens
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERRO: $1${NC}"
}

# Verifica se o domínio principal foi fornecido
if [ -z "$1" ] || [ -z "$2" ]; then
    error "Uso: $0 <dominio-principal> <email-admin>"
    exit 1
fi

DOMAIN=$1
EMAIL=$2

# Cria diretórios necessários
log "Criando diretórios para certificados..."
mkdir -p ./certbot/conf
mkdir -p ./certbot/www
mkdir -p ./certbot/logs

# Gera configuração DH params
if [ ! -f ./certbot/conf/dhparam.pem ]; then
    log "Gerando parâmetros Diffie-Hellman..."
    openssl dhparam -out ./certbot/conf/dhparam.pem 2048
fi

# Inicia o Nginx com configuração temporária
log "Iniciando Nginx..."
docker-compose up -d nginx

# Espera o Nginx iniciar
sleep 5

# Obtém o certificado inicial
log "Obtendo certificado SSL inicial para $DOMAIN..."
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --domain $DOMAIN \
    --agree-tos \
    --non-interactive \
    --expand \
    --rsa-key-size 4096

if [ $? -ne 0 ]; then
    error "Falha ao obter certificado SSL"
    exit 1
fi

# Reinicia o Nginx para usar o novo certificado
log "Reiniciando Nginx..."
docker-compose restart nginx

log "Configuração SSL concluída com sucesso!"
log "Domínio principal configurado: $DOMAIN"
log "Email admin: $EMAIL"
log "Para adicionar novos domínios, use o script ssl-cert-manager.sh"
