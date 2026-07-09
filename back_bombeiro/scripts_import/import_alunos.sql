-- Script de Importação de Alunos - Gerado automaticamente
-- Execute no servidor remoto onde o Laravel está instalado

USE `platformxcom_escola`;

SET @import_start = NOW();

-- Desative foreign keys temporariamente para evitar erros
SET FOREIGN_KEY_CHECKS = 0;

-- Inserir Alunos (exemplo com os primeiros registros)
INSERT INTO `alunos` (
    `nome`, `sexo`, `cpf`, `data_nascimento`, `telefone`, `email`,
    `cep`, `logradouro`, `numero`, `bairro`, `cidade`, `uf`,
    `nome_pai`, `nome_mae`, `responsavel`, `cpf_responsavel`,
    `telefone_responsavel`, `turma`, `status`, `situacao`,
    `ano_letivo`, `created_at`, `updated_at`
) VALUES
-- Registro 1
('ADRIAN BENÍCIO COSTA MELO', 'masculino', '10832057304', '2019-10-11', '(98)99607-6494', 'marciorpmelo@hotmail.com',
 '65130-000', 'RUA 13 DE MAIO', '5', 'TAPERINHA', 'PAÇO DO LUMIAR', 'MA',
 'MARCIO ROBERTO PEREIRA MELO', 'ADRIANA SHELLYDA PEREIRA COSTA', 'MARCIO ROBERTO PEREIRA MELO', '87123452372',
 '(98)99607-6494', '1º Ano A', 'ativo', 'em_dia', '2026', NOW(), NOW()),
-- Registro 2
('ADRIEL LEVI OLIVEIRA FERNANDES', 'masculino', '10973341394', '2019-12-12', '(98)99973-5069', 'luana.oliveira2211@hotmail.com',
 '65130-000', 'AVENIDA CHICO MENDES QD 55', '07', 'CIDADE VERDE 2', 'PAÇO DO LUMIAR', 'MA',
 'EDENILSON DOS SANTOS FERNANDES', 'LUANA OLIVEIRA FERNANDES', 'LUANA OLIVEIRA FERNANDES', '02962686311',
 '(98)99973-5069', '1º Ano A', 'ativo', 'em_dia', '2026', NOW(), NOW());

-- Adicione mais registros aqui...

-- Reative foreign keys
SET FOREIGN_KEY_CHECKS = 1;

-- Atualizar ou criar associados
-- (Execute após a importação dos alunos)

SELECT @import_end := NOW();
SELECT 
    'Importação concluída' as status,
    TIMESTAMPDIFF(SECOND, @import_start, @import_end) as duracao_segundos;