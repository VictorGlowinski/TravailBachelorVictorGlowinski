<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Anamnese extends Model
{
    
    protected $table = 'anamnese'; // Nom de la table
    protected $primaryKey = 'ana_id'; // Nom personnalisé pour l'ID
    protected $fillable = [
        'ana_user_id',
        'ana_imc',
        'ana_blessures',
        'ana_etat_actuel',
        'ana_sexe',
        'ana_poids_kg',
        'ana_taille_cm',
        'ana_age',
        'ana_contrainte_pro',
        'ana_contrainte_fam',
        'ana_exp_sportive',
        'ana_objectif',
        'ana_commentaire',
        'ana_traitement',
        'ana_diagnostics'

    ];

  
    protected $casts = [
        'ana_id'         => 'integer',
        'ana_user_id'    => 'integer',
        'ana_date'       => 'datetime',   // nécessite une colonne date/datetime
        'ana_age'        => 'integer',
        'ana_poids_kg'   => 'float',
        'ana_taille_cm'  => 'float',
        'ana_imc'        => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'ana_user_id', 'id');
    }

    public function scopeSearch($query, ?string $keyword)
    {
        if (!$keyword) return $query;

        return $query->where(function ($q) use ($keyword) {
            $q->where('ana_blessures', 'like', "%{$keyword}%")
            ->orWhere('ana_etat_actuel', 'like', "%{$keyword}%")
            ->orWhere('ana_sexe', 'like', "%{$keyword}%")
            ->orWhere('ana_objectif', 'like', "%{$keyword}%")
            ->orWhere('ana_commentaire', 'like', "%{$keyword}%")
            ->orWhere('ana_traitement', 'like', "%{$keyword}%")
            ->orWhere('ana_diagnostics', 'like', "%{$keyword}%");
        });
    }

    public static function getAnamneseById($id)
    {
        return self::find($id);
    }

    public static function createAnamnese($data)
    {
        return self::create($data);
    }

    public static function updateAnamnese($id, $data)
    {
        $anamnese = self::find($id);
        if ($anamnese) {
            $anamnese->update($data);
            return $anamnese;
        }
        return null;
    }

    public static function deleteAnamnese($id)
    {
        $anamnese = self::find($id);
        if ($anamnese) {
            $anamnese->delete();
            return true;
        }
        return false;
    }

    public static function getAnamneseByUserId($userId)
    {
        return self::where('ana_user_id', $userId)->get();
    }




}
