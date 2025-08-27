<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Plan;          
use App\Models\ActiviteGeneree; 

class Jour extends Model
{
    protected $table = 'jour';
    protected $primaryKey = 'jou_id';
    
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

    // ✅ RELATIONS SEULEMENT
    public function plan()
    {
        return $this->belongsTo(Plan::class, 'jou_plan_id', 'pla_id');
    }

    public function activites()
    {
        return $this->hasMany(ActiviteGeneree::class, 'gen_jour_id', 'jou_id');
    }

    // ✅ SCOPES SEULEMENT
    public function scopeSearch($query, ?string $keyword)
    {
        if (!$keyword) return $query;

        return $query->where(function ($q) use ($keyword) {
            $q->where('jou_description', 'like', "%{$keyword}%")
              ->orWhere('jou_date', 'like', "%{$keyword}%");
        });
    }

    public static function getTodayActivitiesForUser($userId)
    {
        $today = now()->format('Y-m-d');
        
        return self::whereDate('jou_date', $today)
                ->whereHas('plan', function($query) use ($userId) {
                    $query->where('pla_user_id', $userId);
                })
                ->with(['activites', 'plan'])
                ->first();
    }

    public static function getActivitiesForUserAndDate($userId, $date)
    {
        return self::whereDate('jou_date', $date)
                ->whereHas('plan', function($query) use ($userId) {
                    $query->where('pla_user_id', $userId);
                })
                ->with(['activites', 'plan'])
                ->first();
    }

}