<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('expenses', 'data') && Schema::hasColumn('expenses', 'data_vencimento')) {
            Schema::table('expenses', function (Blueprint $table) {
                $table->dropColumn('data');
            });
        } elseif (Schema::hasColumn('expenses', 'data') && !Schema::hasColumn('expenses', 'data_vencimento')) {
            Schema::table('expenses', function (Blueprint $table) {
                $table->renameColumn('data', 'data_vencimento');
            });
        }
    }

    public function down(): void
    {
    }
};