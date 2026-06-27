<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->date('data');
            $table->foreignId('financial_category_id')->constrained()->cascadeOnDelete();
            $table->string('descricao');
            $table->string('fornecedor')->nullable();
            $table->decimal('valor', 10, 2);
            $table->string('forma_pagamento')->nullable();
            $table->date('data_vencimento')->nullable();
            $table->date('data_pagamento')->nullable();
            $table->string('status')->default('pendente'); // pendente, pago, atrasado, cancelado
            $table->foreignId('cost_center_id')->nullable()->constrained()->nullOnDelete();
            $table->string('comprovante')->nullable();
            $table->text('observacoes')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
