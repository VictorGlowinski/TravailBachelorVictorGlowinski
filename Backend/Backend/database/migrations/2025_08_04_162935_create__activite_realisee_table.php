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
        Schema::create('activite_realisee', function (Blueprint $table) {
            $table->id('rea_id'); // nom personnalisé pour l’ID
            $table->unsignedBigInteger('rea_user_id');
            $table->foreign('rea_user_id')->references('use_id')->on('users')->onDelete('cascade');
            $table->string('rea_nom' )->nullable();
            $table->string('rea_type');
            $table->time('rea_duree');
            $table->date('rea_date');
            $table->float('rea_distance');
            $table->string('rea_intensite')->nullable();
            $table->text('rea_commentaire')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activite_realisee');
    }
};
