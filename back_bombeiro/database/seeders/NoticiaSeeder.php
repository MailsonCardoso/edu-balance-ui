<?php

namespace Database\Seeders;

use App\Models\Noticia;
use Illuminate\Database\Seeder;

class NoticiaSeeder extends Seeder
{
    public function run(): void
    {
        $noticias = [
            [
                'title' => 'Nova diretoria toma posse e inicia processo de regularização',
                'summary' => 'A nova gestão da APA CMCB XII iniciou os trabalhos com foco em transparência, reconstrução institucional e regularização documental de todos os processos.',
                'category' => 'Comunicados',
                'status' => 'publicado',
                'published_at' => '2026-06-10 09:00:00',
            ],
            [
                'title' => 'Prestação de contas do primeiro trimestre disponível',
                'summary' => 'Balancete referente ao período de janeiro a março já está disponível no Portal da Transparência para consulta e download dos associados.',
                'category' => 'Transparência',
                'status' => 'publicado',
                'published_at' => '2026-06-05 09:00:00',
            ],
            [
                'title' => 'Assembleia Geral convocada para o dia 30 de julho',
                'summary' => 'Edital de convocação foi publicado com antecedência. Pauta inclui eleição da diretoria definitiva e aprovação do novo estatuto.',
                'category' => 'Eventos',
                'status' => 'publicado',
                'published_at' => '2026-06-01 09:00:00',
            ],
            [
                'title' => 'Campanha de regularização de associados',
                'summary' => 'Associados com pendências podem regularizar sua situação com condições especiais até o fim do mês. Procure a secretaria da APA.',
                'category' => 'Comunicados',
                'status' => 'publicado',
                'published_at' => '2026-05-28 09:00:00',
            ],
            [
                'title' => 'Projeto de apoio pedagógico é aprovado',
                'summary' => 'Novo projeto de reforço escolar será implementado a partir do segundo semestre, beneficiando alunos com dificuldades de aprendizagem.',
                'category' => 'Projetos',
                'status' => 'publicado',
                'published_at' => '2026-05-20 09:00:00',
            ],
            [
                'title' => 'Homenagem aos professores pelo seu dia',
                'summary' => 'A APA presta homenagem a todos os professores pelo seu dia, reconhecendo o trabalho essencial na formação dos nossos alunos.',
                'category' => 'Homenagens',
                'status' => 'publicado',
                'published_at' => '2026-05-15 09:00:00',
            ],
            [
                'title' => 'Oficina de música abre inscrições',
                'summary' => 'Estão abertas as inscrições para a oficina de música da APA. Vagas limitadas para alunos do 6º ao 9º ano.',
                'category' => 'Projetos',
                'status' => 'publicado',
                'published_at' => '2026-05-10 09:00:00',
            ],
            [
                'title' => 'Resultados da pesquisa de satisfação',
                'summary' => 'Pesquisa realizada com os associados aponta alto grau de satisfação com as novas medidas de transparência adotadas pela gestão.',
                'category' => 'Comunicados',
                'status' => 'publicado',
                'published_at' => '2026-05-05 09:00:00',
            ],
            [
                'title' => 'Festival de talentos da APA',
                'summary' => 'Inscrições abertas para o festival de talentos. Alunos podem se inscrever nas categorias música, dança, teatro e artes visuais.',
                'category' => 'Eventos',
                'status' => 'publicado',
                'published_at' => '2026-04-28 09:00:00',
            ],
            [
                'title' => 'Parceria com universidade local',
                'summary' => 'Nova parceria firmada com universidade local para oferecer estágios e projetos de extensão aos alunos do CMCB XII.',
                'category' => 'Projetos',
                'status' => 'publicado',
                'published_at' => '2026-04-20 09:00:00',
            ],
            [
                'title' => 'Relatório de auditoria é concluído',
                'summary' => 'Auditoria independente concluiu os trabalhos. Relatório completo está disponível para consulta dos associados.',
                'category' => 'Transparência',
                'status' => 'publicado',
                'published_at' => '2026-04-15 09:00:00',
            ],
            [
                'title' => 'Doação de livros para biblioteca',
                'summary' => 'Campanha de doação de livros arrecadou mais de 200 exemplares que serão incorporados ao acervo da biblioteca escolar.',
                'category' => 'Projetos',
                'status' => 'publicado',
                'published_at' => '2026-04-10 09:00:00',
            ],
        ];

        foreach ($noticias as $noticia) {
            Noticia::firstOrCreate(
                ['title' => $noticia['title']],
                $noticia
            );
        }

        $this->command->info(count($noticias) . ' notícias populadas com sucesso!');
    }
}
