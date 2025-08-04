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
        Schema::create('plan', function (Blueprint $table) {
            $table->id('pla_id'); // nom personnalisé pour l’ID
            $table->unsignedBigInteger('pla_user_id');
            $table->foreign('pla_user_id')->references('use_id')->on('users')->onDelete('cascade');
            $table->string('pla_nom');
            $table->date('pla_debut')->nullable();
            $table->date('pla_fin')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plan');
    }
};
