<?php

namespace Database\Seeders;

use App\Models\Categoria;
use Illuminate\Database\Seeder;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = ['Comunicados', 'Eventos', 'Transparência', 'Projetos', 'Homenagens'];

        foreach ($categorias as $name) {
            Categoria::firstOrCreate(['name' => $name]);
        }

        $this->command->info(count($categorias) . ' categorias populadas com sucesso!');
    }
}
