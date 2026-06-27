<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('revenues', function (Blueprint $table) {
            $table->id();
            $table->date('data');
            $table->foreignId('financial_category_id')->constrained()->cascadeOnDelete();
            $table->string('descricao');
            $table->decimal('valor', 10, 2);
            $table->string('forma_pagamento')->nullable();
            $table->foreignId('cost_center_id')->nullable()->constrained()->nullOnDelete();
            $table->string('comprovante')->nullable();
            $table->text('observacoes')->nullable();
            $table->string('origem')->nullable(); // manual, mensalidade
            $table->foreignId('mensalidade_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->default('recebido'); // recebido, pendente, cancelado
            $table->date('data_recebimento')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('revenues');
    }
};
