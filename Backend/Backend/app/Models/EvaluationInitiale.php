<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EvaluationInitiale extends Model
{
    protected $table = 'evaluation_initiale'; // Nom de la table
    protected $primaryKey = 'eva_id'; // Nom personnalisé pour l'ID
    protected $fillable = [
        'eva_user_id',
        'eva_vo2max',
        'eva_freq_repos',
        'eva_freq_max',
        'eva_ftp_cyclisme',
        'eva_vma',
        'eva_cooper',
        'eva_nb_heure_dispo',
        'eva_seuil_natation',
        'eva_seuil_cyclisme',
        'eva_seuil_course',
        'eva_commentaire',
        'eva_objectif',
        'eva_echeance'
    ];

    protected $casts = [
        'eva_id' => 'integer',
        'eva_user_id' => 'integer',
        'eva_vo2max' => 'float',
        'eva_freq_repos' => 'integer',
        'eva_freq_max' => 'integer',
        'eva_ftp_cyclisme' => 'integer',
        'eva_vma' => 'float',
        'eva_cooper' => 'string',
        'eva_nb_heure_dispo' => 'integer',
        'eva_seuil_natation' => 'string',
        'eva_seuil_cyclisme' => 'string',
        'eva_seuil_course' => 'string',
        'eva_commentaire' => 'string',
        'eva_objectif' => 'string',
        'eva_echeance' => 'date'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'eva_user_id', 'id');
    }

    
    public function scopeSearch($query, ?string $keyword)
    {
        if (!$keyword) return $query;
        return $query->where(function ($q) use ($keyword) {
            $q->where('eva_vo2max', 'like', "%{$keyword}%")
              ->orWhere('eva_freq_max', 'like', "%{$keyword}%")
              ->orWhere('eva_seuil_ventilatoire', 'like', "%{$keyword}%")
              ->orWhere('eva_ftp_cyclisme', 'like', "%{$keyword}%")
              ->orWhere('eva_vma', 'like', "%{$keyword}%")
              ->orWhere('eva_cooper', 'like', "%{$keyword}%")
              ->orWhere('eva_sueil_natation', 'like', "%{$keyword}%");
        });

    }

    public static function getEvaluationInitialeById($id)
    {
        return self::find($id);
    }

    public static function updateEvaluationInitiale($id, $data)
    {
        $evaluation = self::find($id);
        if ($evaluation) {
            $evaluation->update($data);
            return $evaluation;
        }
        return null;
    }


    public static function createEvaluationInitiale($data)
    {
        return self::create($data);
    }

    public static function deleteEvaluationInitiale($id)
    {
        $evaluation = self::find($id);
        if ($evaluation) {
            return $evaluation->delete();
        }
        return false;
    }
    

    public static function getEvaluationInitialeByUserId($userId)
        {
            return self::where('eva_user_id', $userId)->first();
        }
    
}
