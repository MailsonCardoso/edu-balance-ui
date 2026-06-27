<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isFinanceiro(): bool
    {
        return $this->role === 'financeiro';
    }

    public function isSecretaria(): bool
    {
        return $this->role === 'secretaria';
    }

    public function isDirecao(): bool
    {
        return $this->role === 'direcao';
    }

    public function hasPermission(string $permission): bool
    {
        if ($this->isAdmin()) return true;

        $permissoes = [
            'financeiro' => [
                'manage_revenues', 'manage_expenses', 'view_reports',
                'view_dashboard', 'view_dre', 'manage_categories',
            ],
            'secretaria' => [
                'view_revenues', 'create_revenues',
            ],
            'direcao' => [
                'view_dashboard', 'view_reports', 'view_dre', 'view_indicators',
            ],
        ];

        return in_array($permission, $permissoes[$this->role] ?? []);
    }
}
