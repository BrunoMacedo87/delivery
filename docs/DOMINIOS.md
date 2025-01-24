# Configuração de Domínios e SSL

Este documento explica como configurar novos domínios e certificados SSL no sistema.

## Requisitos

1. Servidor com Docker e Docker Compose instalados
2. Domínio registrado e apontando para o IP do servidor
3. Portas 80 e 443 liberadas no firewall

## Configuração Inicial

1. Configure o domínio principal do sistema:

```bash
# Na primeira vez, execute:
chmod +x scripts/init-ssl.sh
./scripts/init-ssl.sh seu-dominio.com admin@seu-dominio.com
```

## Adicionando Novos Domínios

1. Certifique-se que o domínio está apontando para o IP do servidor
2. Execute o script de gerenciamento de certificados:

```bash
chmod +x scripts/ssl-cert-manager.sh
./scripts/ssl-cert-manager.sh generate novo-dominio.com admin@seu-dominio.com
```

## Renovação Automática

Os certificados são renovados automaticamente a cada 12 horas (se necessário).
O Nginx é recarregado automaticamente após cada renovação.

## Estrutura de Diretórios

```
certbot/
├── conf/           # Certificados e configurações
├── www/            # Arquivos para validação do domínio
└── logs/           # Logs do Certbot
```

## Troubleshooting

### Erro de DNS
- Verifique se o domínio está apontando corretamente para o IP do servidor
- Use o comando `dig` ou `nslookup` para verificar os registros DNS

### Erro de Certificado
- Verifique os logs em `certbot/logs/`
- Certifique-se que as portas 80 e 443 estão liberadas
- Tente renovar manualmente: `./scripts/ssl-cert-manager.sh renew`

### Nginx não Inicia
- Verifique os logs do Nginx: `docker-compose logs nginx`
- Certifique-se que não há outro serviço usando as portas 80 e 443

## Manutenção

### Backup dos Certificados
Faça backup regular do diretório `certbot/conf/`:
```bash
tar -czf backup-certs-$(date +%Y%m%d).tar.gz certbot/conf/
```

### Monitoramento
Monitore o status dos certificados:
```bash
docker-compose exec certbot certbot certificates
```
