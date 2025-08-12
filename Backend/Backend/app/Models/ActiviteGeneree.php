<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActiviteGeneree extends Model
{
    protected $table = 'activite_generee'; // Nom de la table
    protected $primaryKey = 'gen_id'; // Nom personnalisé pour l'ID
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
        'gen_duree'     => 'string',
        'gen_distance'  => 'integer',
    ];

    public static function jour()
    {
        return $this->belongsTo(Jour::class, 'gen_jour_id', 'jou_id');
    }

    public function scopeSearch($query, ?string $keyword)
    {
        if (!$keyword) return $query;
        return $query->where(function ($q) use ($keyword) {
            $q->where('gen_nom', 'like', "%{$keyword}%")
              ->orWhere('gen_type', 'like', "%{$keyword}%")
              ->orWhere('gen_commentaire', 'like', "%{$keyword}%");
        });
    }

    public static function getActiviteGenereeById($id)
    {
        return self::find($id);
    }

    

    public static function createActiviteGeneree($data)
    {
        return self::create($data);
    }

    public static function updateActiviteGeneree($id, $data)
    {
        $activite = self::find($id);
        if ($activite) {
            $activite->update($data);
            return $activite;
        }
        return null;
    }

    public static function deleteActiviteGeneree($id)
    {
        $activite = self::find($id);
        if ($activite) {
            $activite->delete();
            return true;
        }
        return false;
    }
}
