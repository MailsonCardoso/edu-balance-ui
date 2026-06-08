<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alunos', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('cpf', 14)->nullable();
            $table->string('data_nascimento', 10);
            $table->string('telefone', 20)->nullable();
            $table->string('email')->nullable();
            $table->string('endereco')->nullable();
            $table->string('responsavel');
            $table->string('cpf_responsavel', 14)->nullable();
            $table->string('telefone_responsavel', 20)->nullable();
            $table->string('turma');
            $table->enum('status', ['ativo', 'inativo'])->default('ativo');
            $table->enum('situacao', ['em_dia', 'em_atraso', 'inadimplente'])->default('em_dia');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alunos');
    }
};
