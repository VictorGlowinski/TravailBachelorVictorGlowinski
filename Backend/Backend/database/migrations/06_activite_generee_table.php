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
        Schema::create('activiteGeneree', function (Blueprint $table) {
            $table->id('gen_id'); // nom personnalisé pour l’ID
            $table->unsignedBigInteger('gen_jour_id');
            $table->foreign('gen_jour_id')->references('jou_id')->on('jour')->onDelete('cascade');

            $table->string('gen_nom')->nullable(); // nom de l'activité, peut être généré automatiquement
            $table->string('gen_type');
            $table->time('gen_duree');
            $table->float('gen_distance');
            $table->string('gen_intensite');
            $table->text('gen_commentaire');
            $table->string('gen_source'); // ex: 'openai', 'mistral', etc.

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activite_generee');
    }
};
