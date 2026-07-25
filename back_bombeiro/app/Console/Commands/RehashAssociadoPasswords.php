<?php

namespace App\Console\Commands;

use App\Models\Associado;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class RehashAssociadoPasswords extends Command
{
    protected $signature = 'associado:rehash-passwords';
    protected $description = 'Corrige senhas duplicadas (bcrypt de bcrypt) dos associados existentes';

    public function handle(): int
    {
        $total = Associado::count();
        $bar = $this->output->createProgressBar($total);
        $bar->start();

        $count = 0;
        Associado::chunk(100, function ($associados) use ($bar, &$count) {
            foreach ($associados as $associado) {
                $cpf = $associado->cpf;
                $currentHash = $associado->password;

                if (!Hash::check($cpf, $currentHash)) {
                    $associado->forceFill(['password' => $cpf])->save();
                    $count++;
                }
                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine();
        $this->info("{$count} senhas corrigidas de {$total} associados.");
        return Command::SUCCESS;
    }
}