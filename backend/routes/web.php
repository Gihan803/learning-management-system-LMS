<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
    'message' => 'LMS Backend API is running...',
    'status' => 'success'
    ]);
});
