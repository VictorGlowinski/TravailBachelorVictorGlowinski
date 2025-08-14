<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Jour;
use App\Models\ActiviteGeneree;

class Plan extends Model
{
    protected $table = 'plan';
    protected $primaryKey = 'pla_id';
    
    protected $fillable = [
        'pla_user_id',
        'pla_nom',
        'pla_debut',
        'pla_fin'
    ];

    protected $casts = [
        'pla_id' => 'integer',
        'pla_user_id' => 'integer',
        'pla_debut' => 'date',
        'pla_fin' => 'date',
    ];

    // ✅ RELATIONS SEULEMENT
    public function user()
    {
        return $this->belongsTo(User::class, 'pla_user_id', 'id');
    }

    public function jours()
    {
        return $this->hasMany(Jour::class, 'jou_plan_id', 'pla_id');
    }

    public function activites()
    {
        return $this->hasManyThrough(
            ActiviteGeneree::class,
            Jour::class,
            'jou_plan_id',  // Clé étrangère sur la table jours
            'gen_jour_id',  // Clé étrangère sur la table activites_generees
            'pla_id',       // Clé locale sur la table plans
            'jou_id'        // Clé locale sur la table jours
        );
    }

    // ✅ SCOPES SI NÉCESSAIRES
    public function scopeSearch($query, ?string $keyword)
    {
        if (!$keyword) return $query;
        
        return $query->where('pla_nom', 'like', "%{$keyword}%");
    }

}