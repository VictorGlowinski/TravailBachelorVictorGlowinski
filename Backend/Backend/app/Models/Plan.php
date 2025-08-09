<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $table = 'plan'; // Nom de la table
    protected $primaryKey = 'pla_id'; // Nom personnalisé pour l'ID
    protected $fillable = [
        'pla_user_id',
        'pla_nom',
        'pla_description',
        'pla_date_debut',
        'pla_date_fin'
    ];

    protected $casts = [
        'pla_id' => 'integer',
        'pla_user_id' => 'integer',
        'pla_date_debut' => 'date',
        'pla_date_fin' => 'date',
    ];

    public static function user()
    {
        return $this->belongsTo(User::class, 'pla_user_id', 'id');
    }

    public static function getAllPlans($keyword)
    {
        if (empty($keyword)) {
            return self::all();
        }
        return self::where('pla_nom', 'like', '%' . $keyword . '%')
            ->orWhere('pla_description', 'like', '%' . $keyword . '%')
            ->get();
    }

    public static function getPlanById($id)
    {
        return self::find($id);
    }

    public static function createPlan($data)
    {
        return self::create($data);
    }

    public static function updatePlan($id, $data)
    {
        $plan = self::find($id);
        if ($plan) {
            $plan->update($data);
            return $plan;
        }
        return null;
    }

    public static function deletePlan($id)
    {
        $plan = self::find($id);
        if ($plan) {
            $plan->delete();
            return true;
        }
        return false;
    }

    public static function getPlansByUserId($userId)
    {
        return self::where('pla_user_id', $userId)->get();
    }
}
