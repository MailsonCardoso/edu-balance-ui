<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = ['Comunicados', 'Eventos', 'Transparência', 'Projetos', 'Homenagens'];

        foreach ($categorias as $name) {
            Categoria::firstOrCreate(['name' => $name]);
        }
    }
}
