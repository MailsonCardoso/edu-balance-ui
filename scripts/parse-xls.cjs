const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

// Caminhos dos arquivos
const excelPath = process.argv[2] || 'C:\\Users\\Mailson\\Documents\\Projetos\\escola_bombeiro\\edu-balance-ui\\scripts\\DADOS_APA_alterar.xls';
const outputPath = process.argv[3] || 'C:\\Users\\Mailson\\Documents\\Projetos\\escola_bombeiro\\edu-balance-ui\\scripts\\output.json';

if (!fs.existsSync(excelPath)) {
  console.error(`ERRO: Arquivo Excel não encontrado: ${excelPath}`);
  console.error('Por favor, verifique se o arquivo DADOS_APA_alterar.xls está no diretório correto');
  process.exit(1);
}

const wb = xlsx.readFile(excelPath);
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(ws, { header: 1 });

const headers = rows[0];
const data = rows.slice(1);

function get(row, idx) { return row[idx] != null ? String(row[idx]).trim() : ''; }

function parseEndereco(endereco) {
  if (!endereco) return { logradouro: '', numero: '' };
  const parts = endereco.split(',');
  const numero = parts.pop().trim();
  const logradouro = parts.join(',').trim();
  return { logradouro, numero };
}

function parseCidade(cidadeComUf) {
  if (!cidadeComUf) return { cidade: '', uf: '' };
  const match = cidadeComUf.match(/^(.+?)\s*-\s*([A-Z]{2})$/);
  if (match) {
    return { cidade: match[1].trim(), uf: match[2].toUpperCase() };
  }
  return { cidade: cidadeComUf, uf: '' };
}

function normalizeTurma(serieturma) {
  if (!serieturma) return '';
  // Extrai a parte antes do primeiro " - " (ex: '1º ANO "A"')
  const turmaFull = serieturma.split(' - ')[0].trim();
  // Converte '1º ANO "A"' para '1º Ano A'
  return turmaFull
    .replace(/º\s*ANO\s*/i, 'º Ano ')
    .replace(/"([A-Z])"/, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function normalizeSexo(sexo) {
  const s = (sexo || '').toLowerCase().trim();
  if (s === 'masculino') return 'masculino';
  if (s === 'feminino') return 'feminino';
  return '';
}

const result = [];

for (const row of data) {
  if (!get(row, 2)) continue; // nomealuno vazio = pula

  const endereco = parseEndereco(get(row, 13));
  const cidadeParsed = parseCidade(get(row, 15));

  result.push({
    nome: get(row, 2),
    sexo: normalizeSexo(get(row, 3)),
    dataNascimento: get(row, 5),
    cpf: get(row, 6),
    telefone: get(row, 9) || get(row, 10),
    email: get(row, 11),
    cep: get(row, 12),
    logradouro: endereco.logradouro,
    numero: endereco.numero,
    bairro: get(row, 14),
    cidade: cidadeParsed.cidade,
    uf: cidadeParsed.uf,
    nomeMae: get(row, 29),
    nomePai: get(row, 37),
    responsavel: get(row, 56),
    cpfResponsavel: get(row, 57),
    telefoneResponsavel: get(row, 59) || get(row, 58),
    emailResponsavel: get(row, 60),
    endResp: get(row, 61),
    cepResp: get(row, 62),
    cidadeResp: get(row, 63),
    bairroResp: get(row, 64),
    parentescoResp: get(row, 65),
    turma: normalizeTurma(get(row, 46)),
    anoLetivo: get(row, 47),
    matricula: get(row, 0),
  });
}

// Grava o JSON no arquivo de saída
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');

console.log(`Parse completo. ${result.length} registros importados.`);
console.log(`Arquivo salvo em: ${outputPath}`);
