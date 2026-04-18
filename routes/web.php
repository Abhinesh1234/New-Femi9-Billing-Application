<?php

use Illuminate\Support\Facades\Route;

// Catch-all route: serve React SPA for all non-API routes
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
