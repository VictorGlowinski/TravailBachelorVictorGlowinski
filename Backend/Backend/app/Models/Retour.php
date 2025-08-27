<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Retour extends Model
{
    protected $table = 'retour'; // Nom de la table
    protected $primaryKey = 'ret_id'; // Nom personnalisé pour l'ID
    protected $fillable = [
        'ret_user_id',
        'ret_commentaire',
        'ret_date'
    ];

  
    protected $casts = [
        'ret_id'         => 'integer',
        'ret_commentaire'=> 'string',
        'ret_date'       => 'date',   
    ];


    protected $hidden = [
        'created_at',
        'updated_at',
    ];


    public function user()
    {
        return $this->belongsTo(User::class, 'ret_user_id', 'id');
    }

    public function scopeSearch($query, ?string $keyword)
    {
        if (!$keyword) return $query;

        return $query->where(function ($q) use ($keyword) {
            $q->where('ret_commentaire', 'like', "%{$keyword}%")
            ->orWhere('ret_date', 'like', "%{$keyword}%");
        });
    }

    public static function getRetourById($id)
    {
        return self::find($id);
    }

    public static function createRetour($data)
    {
        return self::create($data);
    }

    public static function updateRetour($id, $data)
    {
        $retour = self::find($id);
        if ($retour) {
            $retour->update($data);
            return $retour;
        }
        return null;
    }

    public static function deleteRetour($id)
    {
        $retour = self::find($id);
        if ($retour) {
            $retour->delete();
            return true;
        }
        return false;
    }

    public static function getAllRetours()
    {
        return self::all();
    }
}
