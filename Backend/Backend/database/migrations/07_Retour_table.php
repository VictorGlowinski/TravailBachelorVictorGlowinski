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
        Schema::create('retour', function (Blueprint $table) {
            $table->id('ret_id'); // nom personnalisé pour l’ID
            $table->unsignedBigInteger('ret_user_id');
            $table->foreign('ret_user_id')->references('id')->on('users')->onDelete('cascade');

           
            $table->text('ret_commentaire');
            $table->date('ret_date');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('retour');
    }
};
