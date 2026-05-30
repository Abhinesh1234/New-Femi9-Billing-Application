<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('role_id');
            $table->string('module', 60);   // e.g. items, invoices, transfer_orders
            $table->boolean('can_view')->default(false);
            $table->boolean('can_create')->default(false);
            $table->boolean('can_edit')->default(false);
            $table->boolean('can_delete')->default(false);
            $table->timestamps();

            $table->foreign('role_id')->references('id')->on('roles')->cascadeOnDelete();
            $table->unique(['role_id', 'module']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('role_permissions');
    }
};
