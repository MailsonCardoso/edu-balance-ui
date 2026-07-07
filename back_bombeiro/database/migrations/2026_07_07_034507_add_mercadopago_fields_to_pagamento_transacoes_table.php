<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pagamento_transacoes', function (Blueprint $table) {
            $table->string('payment_id')->nullable()->after('id')->index();
            $table->string('preference_id')->nullable()->after('payment_id')->index();
            $table->string('external_reference')->nullable()->after('preference_id')->unique();
            $table->string('payment_method')->nullable()->after('qr_code');
            $table->string('payer_email')->nullable()->after('payment_method');
            $table->string('notification_url')->nullable()->after('payer_email');
        });
    }

    public function down(): void
    {
        Schema::table('pagamento_transacoes', function (Blueprint $table) {
            $table->dropColumn(['payment_id', 'preference_id', 'external_reference', 'payment_method', 'payer_email', 'notification_url']);
        });
    }
};
