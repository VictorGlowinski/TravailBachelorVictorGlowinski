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
            $table->foreignId('eva_user_id')->constrained('users', 'id')->onDelete('cascade');
            $table->float('eva_vo2max')->nullable();
            $table->integer('eva_freq_repos')->nullable();
            $table->integer('eva_freq_max')->nullable();
            $table->integer('eva_ftp_cyclisme')->nullable();
            $table->float('eva_vma')->nullable();
            $table->string('eva_cooper')->nullable();
            $table->integer('eva_nb_heure_dispo')->nullable();
            $table->string('eva_seuil_natation')->nullable();
            $table->string('eva_seuil_cyclisme')->nullable();
            $table->string('eva_seuil_course')->nullable();
            $table->string('eva_commentaire')->nullable();
            $table->string('eva_objectif')->nullable();
            $table->date('eva_echeance')->nullable();
            $table->string('eva_exp_triathlon')->nullable();
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
