<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // AJOUT : Import du trait

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens; // AJOUT : HasApiTokens

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'email',
        'password',
        'use_date_naissance',
        'use_consentement',
        'use_derniere_connexion',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'use_date_naissance' => 'date',
            'use_consentement' => 'boolean',
            'use_derniere_connexion' => 'datetime',
        ];
    }

    // AJOUT : Relations si nécessaire
    public function anamneses()
    {
        return $this->hasMany(Anamnese::class, 'use_id');
    }

    public function evaluationsInitiales()
    {
        return $this->hasMany(EvaluationInitiale::class, 'use_id');
    }

    public function plans()
    {
        return $this->hasMany(Plan::class, 'use_id');
    }

    public function activitesRealisees()
    {
        return $this->hasMany(ActiviteRealisee::class, 'use_id');
    }

    
}