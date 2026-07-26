<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('revenues', 'observacao')) {
            Schema::table('revenues', function (Blueprint $table) {
                $table->string('observacao')->nullable()->after('financial_category_id');
            });
        }

        if (!Schema::hasColumn('expenses', 'observacao')) {
            Schema::table('expenses', function (Blueprint $table) {
                $table->string('observacao')->nullable()->after('financial_category_id');
            });
        }
    }

    public function down(): void
    {
        Schema::table('revenues', function (Blueprint $table) {
            $table->dropColumn('observacao');
        });

        Schema::table('expenses', function (Blueprint $table) {
            $table->dropColumn('observacao');
        });
    }
};