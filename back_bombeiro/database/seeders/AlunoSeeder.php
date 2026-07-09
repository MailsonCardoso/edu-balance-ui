<?php

namespace Database\Seeders;

use App\Models\Aluno;
use Illuminate\Database\Seeder;

class AlunoSeeder extends Seeder
{
    public function run(): void
    {
        $this->importFromOutputFile();
    }

    private function importFromOutputFile(): void
    {
        $jsonPath = database_path('alunos_output.json');
        
        if (!file_exists($jsonPath)) {
            $this->createAlunosJsonFile();
        }
        
        $alunos = json_decode(file_get_contents($jsonPath), true);
        
        if (!is_array($alunos)) {
            return;
        }
        
        foreach ($alunos as $alunoData) {
            Aluno::create($this->mapAlunoData($alunoData));
        }
    }

    private function mapAlunoData(array $data): array
    {
        $aluno = [];
        
        $aluno['nome'] = $data['nome'] ?? null;
        $aluno['sexo'] = $data['sexo'] ?? null;
        $aluno['cpf'] = $data['cpf'] ?? null;
        $aluno['data_nascimento'] = $data['dataNascimento'] ?? null;
        $aluno['telefone'] = $data['telefone'] ?? null;
        $aluno['email'] = $data['email'] ?? null;
        $aluno['cep'] = $data['cep'] ?? null;
        $aluno['logradouro'] = $data['logradouro'] ?? null;
        $aluno['numero'] = $data['numero'] ?? null;
        $aluno['bairro'] = $data['bairro'] ?? null;
        $aluno['cidade'] = $data['cidade'] ?? null;
        $aluno['uf'] = $data['uf'] ?? null;
        $aluno['nome_mae'] = $data['nomeMae'] ?? null;
        $aluno['nome_pai'] = $data['nomePai'] ?? null;
        $aluno['responsavel'] = $data['responsavel'] ?? null;
        $aluno['cpf_responsavel'] = $data['cpfResponsavel'] ?? null;
        $aluno['telefone_responsavel'] = $data['telefoneResponsavel'] ?? null;
        $aluno['email_responsavel'] = $data['emailResponsavel'] ?? null;
        $aluno['cep_resp'] = $data['cepResp'] ?? null;
        $aluno['logradouro_resp'] = $data['endResp'] ?? null;
        $aluno['numero_resp'] = null;
        $aluno['bairro_resp'] = $data['bairroResp'] ?? null;
        $aluno['cidade_resp'] = $data['cidadeResp'] ?? null;
        $aluno['parentesco_resp'] = $data['parentescoResp'] ?? null;
        $aluno['turma'] = $data['turma'] ?? null;
        $aluno['ano_letivo'] = $data['anoLetivo'] ?? null;
        $aluno['matricula'] = $data['matricula'] ?? null;
        $aluno['status'] = 'ativo';
        $aluno['situacao'] = 'em_dia';
        
        return $aluno;
    }

    private function createAlunosJsonFile(): void
    {
        $sourcePath = base_path('.output.java');
        $destPath = database_path('alunos_output.json');
        
        if (!file_exists($sourcePath)) {
            return;
        }
        
        $content = file_get_contents($sourcePath);
        $jsonString = $this->convertJavaToJson($content);
        file_put_contents($destPath, $jsonString);
    }

    private function convertJavaToJson(string $content): string
    {
        $content = trim($content);
        $content = substr($content, 1);
        $content = substr($content, 0, -1);
        $content = str_replace('\n', '', $content);
        
        $alunos = [];
        
        preg_match_all('/\{\s*(.*?)\s*\}/s', $content, $matches);
        
        foreach ($matches[0] as $match) {
            $aluno = [];
            
            preg_match_all('/"([^"]+)":\s*"([^"]*)"/', $match, $fields);
            
            for ($i = 0; $i < count($fields[1]); $i++) {
                $key = $fields[1][$i];
                $value = $fields[2][$i];
                $aluno[$key] = $value;
            }
            
            $alunos[] = $aluno;
        }
        
        return json_encode($alunos, JSON_PRETTY_PRINT);
    }
}