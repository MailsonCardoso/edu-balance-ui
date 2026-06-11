<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ouvidorias', function (Blueprint $table) {
            $table->id();
            $table->string('nome')->nullable();
            $table->string('email')->nullable();
            $table->string('tipo');
            $table->text('mensagem');
            $table->boolean('anonimo')->default(false);
            $table->string('protocolo')->unique();
            $table->enum('status', ['pendente', 'respondido'])->default('pendente');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ouvidorias');
    }
};
