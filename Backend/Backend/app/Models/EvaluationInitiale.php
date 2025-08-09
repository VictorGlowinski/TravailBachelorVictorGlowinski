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
        'eva_freq_max',
        'eva_seuil_ventilatoire',
        'eva_ftp_cyclisme',
        'eva_vma',
        'eva_cooper',
        'eva_sueil_natation',
        'eva_echeance',
        'eva_nb_heure_dispo'
    ];

    protected $casts = [
        'eva_id' => 'integer',
        'eva_user_id' => 'integer',
        'eva_vo2max' => 'integer',
        'eva_freq_max' => 'integer',
        'eva_seuil_ventilatoire' => 'integer',
        'eva_ftp_cyclisme' => 'integer',
        'eva_vma' => 'integer',
        'eva_cooper' => 'integer',
        'eva_sueil_natation' => 'integer',
        'eva_echeance' => 'integer',
        'eva_nb_heure_dispo' => 'integer',
    ];

    public static function user()
    {
        return $this->belongsTo(User::class, 'eva_user_id', 'id');
    }

    

    public static function getAllEvaluationsInitiales($keyword)
    {
        if (empty($keyword)) {
            return self::all();
        }
    }

    public static function getEvaluationInitialeById($id)
    {
        return self::find($id);
    }

    public static function updateEvaluationInitiale($data)
    {
        $evaluation = self::find($data['eva_id']);
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
