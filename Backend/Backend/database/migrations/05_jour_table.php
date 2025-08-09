<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jour', function (Blueprint $table) {
            $table->id('jou_id'); // clé primaire personnalisée

            $table->unsignedBigInteger('jou_plan_id');
            $table->foreign('jou_plan_id')->references('pla_id')->on('plan')->onDelete('cascade');

            $table->date('jou_date');
            $table->string('jou_description');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jour');
    }
};
