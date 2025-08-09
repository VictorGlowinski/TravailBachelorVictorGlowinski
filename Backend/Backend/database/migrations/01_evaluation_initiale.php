<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('evaluation_initiale', function (Blueprint $table) {
            $table->id('eva_id');
            $table->foreignId('eva_user_id')->constrained('users', 'use_id')->onDelete('cascade');
            $table->integer('eva_vo2max')->nullable();
            $table->integer('eva_freq_max')->nullable();
            $table->integer('eva_seuil_ventilatoire')->nullable();
            $table->integer('eva_ftp_cyclisme')->nullable();
            $table->integer('eva_vma')->nullable();
            $table->integer('eva_cooper')->nullable();
            $table->integer('eva_sueil_natation')->nullable();
            $table->integer('eva_echeance');
            $table->integer('eva_nb_heure_dispo');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('_evaluation_initiale');
    }
};
