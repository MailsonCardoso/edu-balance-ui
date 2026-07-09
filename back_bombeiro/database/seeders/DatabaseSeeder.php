<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AlunoSeeder::class,
            CategoriaSeeder::class,
            NoticiaSeeder::class,
        ]);
    }
}
