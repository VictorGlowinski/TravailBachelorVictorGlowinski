<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Jour extends Model
{
    protected $table = 'jour'; // Nom de la table
    protected $primaryKey = 'jou_id'; // Nom personnalisé pour l'ID
    protected $fillable = [
        'jou_plan_id',
        'jou_date',
        'jou_description',
    ];

    protected $casts = [
        'jou_id' => 'integer',
        'jou_plan_id' => 'integer',
        'jou_date' => 'date',
    ];

    public function plan()
    {
        return $this->belongsTo(Plan::class, 'jou_plan_id', 'pla_id');
    }

    public function scopeSearch($query, ?string $keyword)
    {
        if (!$keyword) return $query;

        return $query->where(function ($q) use ($keyword) {
            $q->where('jou_description', 'like', "%{$keyword}%")
            ->orWhere('jou_date', 'like', "%{$keyword}%");
        });
    }

    public static function getJourById($id)
    {
        return self::find($id);
    }

    public static function createJour($data)
    {
        return self::create($data);
    }

    public static function updateJour($id, $data)
    {
        $jour = self::find($id);
        if ($jour) {
            $jour->update($data);
            return $jour;
        }
        return null;
    }

    public static function deleteJour($id)
    {
        $jour = self::find($id);
        if ($jour) {
            $jour->delete();
            return true;
        }
        return false;
    }
}

           

