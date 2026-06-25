<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mensalidades', function (Blueprint $table) {
            $table->enum('origem', [
                'mercadopago', 'caixa', 'admin',
                'pix_manual', 'dinheiro', 'transferencia',
            ])->nullable()->after('forma_pagamento');
        });
    }

    public function down(): void
    {
        Schema::table('mensalidades', function (Blueprint $table) {
            $table->dropColumn('origem');
        });
    }
};
