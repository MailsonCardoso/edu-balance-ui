#!/bin/bash
# Script de Importação de Alunos
# Execute no servidor remoto após o deploy

set -e

echo "=== INICIANDO IMPORTAÇÃO DE ALUNOS ==="
echo ""

# Navegar para o diretório do projeto
cd /var/www/seu-projeto/back_bombeiro

# Baixar o script de importação
echo "Baixando script de importação..."
curl -sL "https://raw.githubusercontent.com/MailsonCardoso/edu-balance-ui/main/back_bombeiro/import_alunos_directo.php" -o import_alunos_directo.php

# Baixar o output.json com os dados parseados
echo "Baixando dados parseados..."
curl -sL "https://raw.githubusercontent.com/MailsonCardoso/edu-balance-ui/main/scripts/output.json" -o output.json

# Executar a importação
echo "Executando importação..."
php import_alunos_directo.php output.json

echo ""
echo "=== IMPORTAÇÃO CONCLUÍDA ==="