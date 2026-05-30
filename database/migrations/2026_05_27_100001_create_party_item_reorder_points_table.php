<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('party_item_reorder_points', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('party_id');
            $table->unsignedBigInteger('item_id');
            $table->decimal('reorder_point', 12, 4);
            $table->timestamp('last_notified_at')->nullable();
            $table->timestamps();

            $table->unique(['party_id', 'item_id']);
            $table->foreign('party_id')->references('id')->on('parties')->onDelete('cascade');
            $table->foreign('item_id')->references('id')->on('items')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('party_item_reorder_points');
    }
};
