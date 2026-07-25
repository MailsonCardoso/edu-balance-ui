<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $meses = [
        'Janeiro' => '01', 'Fevereiro' => '02', 'Marco' => '03', 'Abril' => '04',
        'Maio' => '05', 'Junho' => '06', 'Julho' => '07', 'Agosto' => '08',
        'Setembro' => '09', 'Outubro' => '10', 'Novembro' => '11', 'Dezembro' => '12',
    ];

    public function up(): void
    {
        // 1. Remove a unique constraint temporariamente
        Schema::table('mensalidades', function (Blueprint $table) {
            $table->dropUnique(['aluno_id', 'mes_referencia']);
        });

        // 2. Converte mes_referencia de "Julho/2026" para "07/2026"
        foreach ($this->meses as $nome => $num) {
            DB::statement("
                UPDATE mensalidades
                SET mes_referencia = CONCAT('{$num}', '/', SUBSTRING_INDEX(mes_referencia, '/', -1))
                WHERE mes_referencia LIKE '{$nome}/%'
            ");
        }

        // 3. Remove duplicatas geradas pela conversao
        DB::statement('
            DELETE m1 FROM mensalidades m1
            INNER JOIN mensalidades m2
                ON m1.aluno_id = m2.aluno_id
                AND m1.mes_referencia = m2.mes_referencia
                AND m1.id > m2.id
        ');

        // 4. Re-adiciona a unique constraint
        Schema::table('mensalidades', function (Blueprint $table) {
            $table->unique(['aluno_id', 'mes_referencia']);
        });
    }

    public function down(): void
    {
        Schema::table('mensalidades', function (Blueprint $table) {
            $table->dropUnique(['aluno_id', 'mes_referencia']);
        });
    }
};