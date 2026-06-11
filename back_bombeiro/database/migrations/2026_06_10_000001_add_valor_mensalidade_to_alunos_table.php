<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('alunos', function (Blueprint $table) {
            $table->decimal('valor_mensalidade', 10, 2)->default(0)->after('situacao');
            $table->integer('dia_vencimento')->default(10)->after('valor_mensalidade');
        });
    }

    public function down(): void
    {
        Schema::table('alunos', function (Blueprint $table) {
            $table->dropColumn(['valor_mensalidade', 'dia_vencimento']);
        });
    }
};
