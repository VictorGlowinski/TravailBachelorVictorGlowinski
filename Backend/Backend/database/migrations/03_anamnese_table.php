<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('anamnese', function (Blueprint $table) {
            $table->id('ana_id');

            // Clé étrangère vers users.use_id
            $table->unsignedBigInteger('ana_user_id');
            $table->foreign('ana_user_id')->references('use_id')->on('users')->onDelete('cascade');

            $table->float('ana_imc')->nullable();
            $table->string('ana_blessures')->nullable();
            $table->string('ana_etat_actuel')->nullable();
            $table->string('ana_sexe')->nullable();
            $table->float('ana_poids_kg')->nullable();      
            $table->integer('ana_taille_cm')->nullable();    
            $table->integer('ana_age')->nullable();          
            $table->string('ana_contrainte_pro')->nullable();
            $table->string('ana_contrainte_fam')->nullable(); 
            $table->string('ana_exp_sportive')->nullable();
            $table->string('ana_objectif')->nullable();
            $table->text('ana_commentaire')->nullable(); 
            $table->text('ana_traitement')->nullable();
            $table->string('ana_diagnostics')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('anamnese');
    }
};
