<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patrimonios', function (Blueprint $table) {
            $table->id();
            $table->string('tag')->unique();
            $table->string('nome');
            $table->string('numeroSerie')->nullable();
            $table->enum('categoria', ['TI', 'Mobiliário', 'Veículos', 'Eletrodoméstico', 'Imóvel', 'Outros']);
            $table->enum('localizacao', ['Sede', 'Filial', 'Home Office', 'Depósito']);
            $table->string('responsavel');
            $table->string('setor');
            $table->decimal('valorCompra', 12, 2)->default(0);
            $table->decimal('valorDepreciado', 12, 2)->default(0);
            $table->date('dataCompra');
            $table->date('dataUltimaAuditoria')->nullable();
            $table->enum('status', ['ativo', 'em_manutencao', 'baixado', 'emprestado'])->default('ativo');
            $table->text('observacao')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patrimonios');
    }
};
