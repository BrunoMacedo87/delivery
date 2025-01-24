#!/bin/bash

# Diretório onde os certificados serão armazenados
CERTS_DIR="/etc/letsencrypt/live"

# Função para verificar se um domínio já tem certificado
check_cert() {
    local domain=$1
    if [ -d "$CERTS_DIR/$domain" ]; then
        return 0
    else
        return 1
    fi
}

# Função para gerar certificado para um domínio
generate_cert() {
    local domain=$1
    local email=$2

    echo "Gerando certificado para $domain..."
    
    # Tenta gerar o certificado
    certbot certonly --webroot \
        --webroot-path=/var/www/certbot \
        --email $email \
        --domain $domain \
        --agree-tos \
        --non-interactive \
        --expand \
        --rsa-key-size 4096

    if [ $? -eq 0 ]; then
        echo "Certificado gerado com sucesso para $domain"
        return 0
    else
        echo "Erro ao gerar certificado para $domain"
        return 1
    fi
}

# Função para renovar certificados
renew_certs() {
    echo "Renovando certificados..."
    certbot renew --quiet
    if [ $? -eq 0 ]; then
        echo "Certificados renovados com sucesso"
        # Recarrega o Nginx para usar os novos certificados
        nginx -s reload
        return 0
    else
        echo "Erro ao renovar certificados"
        return 1
    fi
}

# Função principal
main() {
    local action=$1
    local domain=$2
    local email=$3

    case $action in
        "generate")
            if [ -z "$domain" ] || [ -z "$email" ]; then
                echo "Uso: $0 generate <domain> <email>"
                exit 1
            fi
            if check_cert "$domain"; then
                echo "Certificado já existe para $domain"
            else
                generate_cert "$domain" "$email"
            fi
            ;;
        "renew")
            renew_certs
            ;;
        *)
            echo "Uso: $0 {generate <domain> <email>|renew}"
            exit 1
            ;;
    esac
}

# Executa a função principal com os argumentos fornecidos
main "$@"
