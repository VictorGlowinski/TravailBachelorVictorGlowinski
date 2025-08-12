<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActiviteRealisee extends Model
{
    protected $table = 'activite_realisee'; // Nom de la table
    protected $primaryKey = 'rea_id'; // Nom personnalisé pour l'ID
    protected $fillable = [
        'rea_user_id',
        'rea_nom',
        'rea_type',
        'rea_duree',
        'rea_date',
        'rea_distance',
        'rea_intensite',
        'rea_commentaire'
    ];

    protected $casts = [
        'rea_id' => 'integer',
        'rea_user_id' => 'integer',
        'rea_duree' => 'string',
        'rea_distance' => 'float',
    ];

    public static function user()
    {
        return $this->belongsTo(User::class, 'rea_user_id', 'id');
    }

    public function scopeSearch($query, ?string $keyword)
    {
        if (!$keyword) return $query;
        return $query->where(function ($q) use ($keyword) {
            $q->where('rea_nom', 'like', "%{$keyword}%")
            ->orWhere('rea_date', 'like', "%{$keyword}%")
            ->orWhere('rea_duree', 'like', "%{$keyword}%")
            ->orWhere('rea_distance', 'like', "%{$keyword}%")
            ->orWhere('rea_intensite', 'like', "%{$keyword}%")
            ->orWhere('rea_type', 'like', "%{$keyword}%")
            ->orWhere('rea_commentaire', 'like', "%{$keyword}%");
        });
    }

    public static function getActiviteRealiseeById($id)
    {
        return self::find($id);
    }
    public static function createActiviteRealisee($data)
    {
        return self::create($data);
    }
    public static function updateActiviteRealisee($id, $data)
    {
        $activite = self::find($id);
        if ($activite) {
            $activite->update($data);
            return $activite;
        }
        return null;
    }
    public static function deleteActiviteRealisee($id)
    {
        $activite = self::find($id);
        if ($activite) {
            $activite->delete();
            return true;
        }
        return false;
    }

    public static function getActivitesByUserId($userId)
    {
        return self::where('rea_user_id', $userId)->get();
    }

}
