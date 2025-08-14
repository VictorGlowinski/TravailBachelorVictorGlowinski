<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Jour;
use App\Models\Plan;

class ActiviteGeneree extends Model
{
    protected $table = 'activite_generee';
    protected $primaryKey = 'gen_id';
    
    protected $fillable = [
        'gen_jour_id',
        'gen_nom',
        'gen_type',
        'gen_duree',
        'gen_distance',
        'gen_intensite',
        'gen_commentaire',
        'gen_source'
    ];

    protected $casts = [
        'gen_id'        => 'integer',
        'gen_jour_id'   => 'integer',
        'gen_duree'     => 'string', // ✅ Gardé string comme vous l'aviez
        'gen_distance'  => 'float',
    ];

    // ✅ RELATIONS SEULEMENT
    public function jour()
    {
        return $this->belongsTo(Jour::class, 'gen_jour_id', 'jou_id');
    }

    public function plan()
    {
        return $this->hasOneThrough(
            Plan::class,    
            Jour::class,    
            'jou_id',       
            'pla_id',       
            'gen_jour_id',  
            'jou_plan_id'   
        );
    }

    // ✅ SCOPES SEULEMENT
    public function scopeSearch($query, ?string $keyword)
    {
        if (!$keyword) return $query;
        
        return $query->where(function ($q) use ($keyword) {
            $q->where('gen_nom', 'like', "%{$keyword}%")
              ->orWhere('gen_type', 'like', "%{$keyword}%")
              ->orWhere('gen_commentaire', 'like', "%{$keyword}%");
        });
    }

}