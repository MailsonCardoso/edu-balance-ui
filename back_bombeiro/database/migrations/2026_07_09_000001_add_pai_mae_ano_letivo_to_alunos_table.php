<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('alunos', function (Blueprint $table) {
            $table->string('nome_pai', 120)->nullable()->after('uf');
            $table->string('nome_mae', 120)->nullable()->after('nome_pai');
            $table->string('ano_letivo', 4)->nullable()->after('dia_vencimento');
        });
    }

    public function down(): void
    {
        Schema::table('alunos', function (Blueprint $table) {
            $table->dropColumn(['nome_pai', 'nome_mae', 'ano_letivo']);
        });
    }
};
