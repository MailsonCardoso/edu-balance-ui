<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('associados', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('cpf', 11)->unique();
            $table->string('email')->unique();
            $table->string('telefone');
            $table->string('nome_aluno')->nullable();
            $table->string('password');
            $table->string('api_token', 80)->nullable()->unique();
            $table->enum('status', ['pendente', 'ativo', 'inativo'])->default('pendente');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('associados');
    }
};
