<?php

/**
 * Script de Importação Direta de Alunos
 * 
 * Uso: php import_alunos.php
 * 
 * Este script lê o output.json gerado pelo parse-xls.cjs
 * e insere os alunos no banco de dados
 */

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$jsonFile = __DIR__ . '/scripts/output.json';

if (!file_exists($jsonFile)) {
    echo "ERRO: Arquivo output.json não encontrado!\n";
    echo "Execute primeiro: node scripts/parse-xls.cjs <arquivo.xls>\n";
    exit(1);
}

$data = json_decode(file_get_contents($jsonFile), true);
if (!is_array($data)) {
    echo "ERRO: Falha ao decodificar JSON\n";
    exit(1);
}

echo "Total de registros a importar: " . count($data) . "\n\n";

$importados = 0;
$pulados = 0;
$associadosCriados = 0;
$associadosVinculados = 0;
$erros = 0;

foreach ($data as $i => $row) {
    try {
        $nome = $row['nome'] ?? '';
        if (empty($nome)) {
            $pulados++;
            continue;
        }

        $cpf = preg_replace('/\D/', '', $row['cpf'] ?? '');
        $cpfResp = preg_replace('/\D/', '', $row['cpfResponsavel'] ?? '');
        $telefone = preg_replace('/\s+/', '', $row['telefone'] ?? '');
        $telefoneResp = preg_replace('/\s+/', '', $row['telefoneResponsavel'] ?? '');
        $email = $row['email'] ?? '';
        $emailResp = $row['emailResponsavel'] ?? '';
        $sexo = strtolower($row['sexo'] ?? 'masculino');
        $dataNasc = $row['dataNascimento'] ?? '01/01/2000';
        $cep = preg_replace('/\s+/', '', $row['cep'] ?? '');

        if (!empty($cpf)) {
            $existe = DB::table('alunos')->where('cpf', $cpf)->exists();
            if ($existe) {
                $pulados++;
                continue;
            }
        }

        $alunoId = DB::table('alunos')->insertGetId([
            'nome' => $nome,
            'sexo' => $sexo,
            'cpf' => $cpf ?: null,
            'data_nascimento' => $dataNasc,
            'telefone' => $telefone ?: null,
            'email' => $email ?: null,
            'cep' => $cep ?: null,
            'logradouro' => $row['logradouro'] ?: null,
            'numero' => $row['numero'] ?: null,
            'bairro' => $row['bairro'] ?: null,
            'cidade' => $row['cidade'] ?: null,
            'uf' => $row['uf'] ?: 'MA',
            'nome_pai' => $row['nomePai'] ?: null,
            'nome_mae' => $row['nomeMae'] ?: null,
            'responsavel' => $row['responsavel'] ?: $row['nomeMae'] ?: '',
            'cpf_responsavel' => $cpfResp ?: null,
            'telefone_responsavel' => $telefoneResp ?: null,
            'turma' => $row['turma'] ?: '',
            'status' => 'ativo',
            'situacao' => 'em_dia',
            'ano_letivo' => $row['anoLetivo'] ?: null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        if (!empty($cpfResp)) {
            $associado = DB::table('associados')
                ->where('cpf', $cpfResp)
                ->orWhere('cpf', preg_replace('/(\d{3})(\d{3})(\d{3})(\d{2})/', '$1.$2.$3-$4', $cpfResp))
                ->first();

            if ($associado) {
                if (!$associado->aluno_id) {
                    DB::table('associados')
                        ->where('id', $associado->id)
                        ->update(['aluno_id' => $alunoId]);
                }
                DB::table('associados')
                    ->where('id', $associado->id)
                    ->update(['nome_aluno' => $nome]);
                $associadosVinculados++;
            } else {
                $nomeResp = $row['responsavel'] ?: $row['nomeMae'] ?: $nome;
                $emailUso = $emailResp ?: ($nomeResp . '@importado.tmp');

                if (DB::table('associados')->where('email', $emailUso)->exists()) {
                    $emailUso = 'importado_' . $alunoId . '_' . $emailUso;
                }

                DB::table('associados')->insert([
                    'nome' => $nomeResp,
                    'cpf' => $cpfResp,
                    'email' => $emailUso,
                    'telefone' => $telefoneResp ?: '',
                    'nome_aluno' => $nome,
                    'password' => Hash::make(substr($cpfResp, 0, 6)),
                    'status' => 'ativo',
                    'aluno_id' => $alunoId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $associadosCriados++;
            }
        }

        $importados++;
    } catch (Exception $e) {
        $erros++;
        echo "Erro no registro " . ($i + 1) . ": " . $e->getMessage() . "\n";
    }

    if (($i + 1) % 50 === 0) {
        echo "Processados: " . ($i + 1) . "/" . count($data) . "\n";
    }
}

echo "\n=== RESULTADO DA IMPORTAÇÃO ===\n";
echo "Importados: $importados\n";
echo "Pulados (duplicatas): $pulados\n";
echo "Associados criados: $associadosCriados\n";
echo "Associados vinculados: $associadosVinculados\n";
echo "Erros: $erros\n";