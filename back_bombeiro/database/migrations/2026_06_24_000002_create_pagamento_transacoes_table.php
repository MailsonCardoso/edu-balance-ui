<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pagamento_transacoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mensalidade_id')->constrained()->onDelete('cascade');
            $table->string('origem'); // mercadopago, caixa
            $table->string('transacao_id')->nullable()->index();
            $table->string('status'); // pending, approved, rejected, refunded
            $table->json('payload_request')->nullable();
            $table->json('payload_response')->nullable();
            $table->string('payment_url')->nullable();
            $table->text('qr_code')->nullable();
            $table->timestamp('data_aprovacao')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pagamento_transacoes');
    }
};
