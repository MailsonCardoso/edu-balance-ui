<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('monthly_closures', function (Blueprint $table) {
            $table->id();
            $table->tinyInteger('month');
            $table->year('year');
            $table->decimal('closing_balance', 10, 2);
            $table->timestamp('closed_at')->useCurrent();
            $table->unique(['month', 'year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monthly_closures');
    }
};
