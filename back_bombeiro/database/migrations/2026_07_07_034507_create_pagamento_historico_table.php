<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pagamento_historico', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mensalidade_id')->constrained()->onDelete('cascade');
            $table->foreignId('pagamento_transacao_id')->nullable()->constrained()->onDelete('set null');
            $table->string('status_anterior')->nullable();
            $table->string('novo_status');
            $table->string('payment_id')->nullable();
            $table->string('external_reference')->nullable();
            $table->string('usuario_responsavel')->nullable();
            $table->json('payload_webhook')->nullable();
            $table->json('resposta_api')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pagamento_historico');
    }
};
