<?php

namespace App\Console\Commands;

use App\Models\Aluno;
use App\Models\Associado;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ImportarAlunosXls extends Command
{
    protected $signature = 'alunos:importar-xls
                            {arquivo : Caminho absoluto do arquivo .xls}
                            {--dry-run : Apenas mostrar o que seria importado sem salvar}';

    protected $description = 'Importa alunos de planilha XLS para o banco de dados';

    public function handle(): int
    {
        $arquivo = $this->argument('arquivo');
        $dryRun = $this->option('dry-run');

        if (!file_exists($arquivo)) {
            $this->error("Arquivo nao encontrado: {$arquivo}");
            return Command::FAILURE;
        }

        $this->info("Lendo planilha: {$arquivo}");

        $nodeScript = base_path('../scripts/parse-xls.cjs');
        if (!file_exists($nodeScript)) {
            $this->error("Script Node nao encontrado: {$nodeScript}");
            return Command::FAILURE;
        }

        $nodeModules = realpath(base_path('../node_modules'));
        $cmd = sprintf('set NODE_PATH=%s && node %s %s', $nodeModules, $nodeScript, escapeshellarg($arquivo));

        $this->line('Executando parser...');
        $output = shell_exec($cmd);

        if (!$output) {
            $this->error('Falha ao executar parser Node.js');
            return Command::FAILURE;
        }

        $rows = json_decode($output, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->error('Erro ao decodificar JSON: ' . json_last_error_msg());
            return Command::FAILURE;
        }

        $this->info("Total de registros na planilha: " . count($rows));
        $this->newLine();

        $importados = 0;
        $pulados = 0;
        $erros = 0;
        $associadosCriados = 0;
        $associadosVinculados = 0;
        $total = count($rows);

        foreach ($rows as $i => $row) {
            try {
                $result = $this->importarRegistro($row, $dryRun);
                if ($result === 'importado') {
                    $importados++;
                } elseif ($result === 'pulado') {
                    $pulados++;
                } elseif ($result === 'associado_vinculado') {
                    $importados++;
                    $associadosVinculados++;
                } elseif ($result === 'associado_criado') {
                    $importados++;
                    $associadosCriados++;
                }
            } catch (\Exception $e) {
                $erros++;
                if (!$dryRun) {
                    Log::error('Erro ao importar aluno', [
                        'nome' => $row['nome'] ?? 'N/I',
                        'cpf' => $row['cpf'] ?? 'N/I',
                        'erro' => $e->getMessage(),
                    ]);
                }
            }
            if (($i + 1) % 50 === 0 || $i === $total - 1) {
                $this->line(sprintf('Processados: %d/%d (importados: %d, pulados: %d, erros: %d)', $i + 1, $total, $importados, $pulados, $erros));
            }
        }

        $this->newLine();

        $this->table(
            ['Resultado', 'Quantidade'],
            [
                ['Importados', $importados],
                ['Pulados (ja existem)', $pulados],
                ['Associados criados', $associadosCriados],
                ['Associados vinculados', $associadosVinculados],
                ['Erros', $erros],
            ]
        );

        if ($dryRun) {
            $this->warn('Modo dry-run: nenhum dado foi salvo no banco.');
        }

        return Command::SUCCESS;
    }

    private function importarRegistro(array $row, bool $dryRun): string
    {
        $cpf = $this->limparCpf($row['cpf'] ?? '');
        $cpfResponsavel = $this->limparCpf($row['cpfResponsavel'] ?? '');

        if (empty($row['nome'])) {
            return 'pulado';
        }

        if (!empty($cpf)) {
            $existe = Aluno::where('cpf', $cpf)
                ->orWhere('cpf', $this->formatarCpf($cpf))
                ->exists();
            if ($existe) {
                return 'pulado';
            }
        }

        $alunoData = [
            'nome' => $row['nome'],
            'sexo' => $row['sexo'] ?: 'masculino',
            'cpf' => $cpf ?: null,
            'data_nascimento' => $row['dataNascimento'] ?: '01/01/2000',
            'telefone' => $row['telefone'] ?: null,
            'email' => $row['email'] ?: null,
            'cep' => $row['cep'] ?: null,
            'logradouro' => $row['logradouro'] ?: null,
            'numero' => $row['numero'] ?: null,
            'bairro' => $row['bairro'] ?: null,
            'cidade' => $row['cidade'] ?: null,
            'uf' => $row['uf'] ?: 'MA',
            'nome_pai' => $row['nomePai'] ?: null,
            'nome_mae' => $row['nomeMae'] ?: null,
            'responsavel' => $row['responsavel'] ?: $row['nomeMae'] ?: '',
            'cpf_responsavel' => $cpfResponsavel ?: null,
            'telefone_responsavel' => $row['telefoneResponsavel'] ?: null,
            'turma' => $row['turma'] ?: '',
            'status' => 'ativo',
            'situacao' => 'em_dia',
            'ano_letivo' => $row['anoLetivo'] ?: null,
        ];

        if ($dryRun) {
            return 'importado';
        }

        $aluno = Aluno::create($alunoData);

        return $this->vincularAssociado($aluno, $cpfResponsavel, $row);
    }

    private function vincularAssociado(Aluno $aluno, string $cpfResponsavel, array $row): string
    {
        if (empty($cpfResponsavel)) {
            return 'importado';
        }

        $associado = Associado::where('cpf', $cpfResponsavel)
            ->orWhere('cpf', $this->formatarCpf($cpfResponsavel))
            ->first();

        if ($associado) {
            if (!$associado->aluno_id) {
                $associado->forceFill(['aluno_id' => $aluno->id])->save();
            }

            $nomesAlunos = $this->formatarNomesAlunos($associado);
            if ($associado->nome_aluno !== $nomesAlunos) {
                $associado->forceFill(['nome_aluno' => $nomesAlunos])->save();
            }

            return 'associado_vinculado';
        }

        $nomeResp = $row['responsavel'] ?: $row['nomeMae'] ?: $aluno->nome;
        $emailResp = $row['emailResponsavel'] ?: ($nomeResp . '@importado.tmp');

        if (Associado::where('email', $emailResp)->exists()) {
            $emailResp = 'importado_' . $aluno->id . '_' . $emailResp;
        }

        $associado = Associado::create([
            'nome' => $nomeResp,
            'cpf' => $cpfResponsavel,
            'email' => $emailResp,
            'telefone' => $row['telefoneResponsavel'] ?: $aluno->telefone ?: '',
            'nome_aluno' => $this->formatarNomesAlunos(null, $aluno),
            'password' => bcrypt(substr($cpfResponsavel, 0, 6)),
            'status' => 'ativo',
            'aluno_id' => $aluno->id,
        ]);

        return 'associado_criado';
    }

    private function formatarNomesAlunos(?Associado $associado = null, ?Aluno $aluno = null): string
    {
        if ($associado) {
            $cpf = $this->limparCpf($associado->cpf);
            $alunos = Aluno::where('cpf_responsavel', $cpf)
                ->orWhere('cpf_responsavel', $this->formatarCpf($cpf))
                ->get();
        } elseif ($aluno) {
            $alunos = collect([$aluno]);
        } else {
            return '';
        }

        return $alunos->map(fn ($a) => explode(' ', trim($a->nome))[0])->implode(' / ');
    }

    private function limparCpf(string $cpf): string
    {
        return preg_replace('/\D/', '', $cpf);
    }

    private function formatarCpf(string $cpf): string
    {
        $clean = $this->limparCpf($cpf);
        if (strlen($clean) === 11) {
            return preg_replace('/(\d{3})(\d{3})(\d{3})(\d{2})/', '$1.$2.$3-$4', $clean);
        }
        return $cpf;
    }
}
