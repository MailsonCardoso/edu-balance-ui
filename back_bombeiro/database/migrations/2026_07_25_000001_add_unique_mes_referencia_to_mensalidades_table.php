<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Remove duplicatas: mantém apenas a mais antiga para cada (aluno_id, mes_referencia)
        DB::statement('
            DELETE m1 FROM mensalidades m1
            INNER JOIN mensalidades m2
                ON m1.aluno_id = m2.aluno_id
                AND m1.mes_referencia = m2.mes_referencia
                AND m1.id > m2.id
        ');

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