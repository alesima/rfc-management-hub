<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RfcController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CommentController;

Route::get('/', [RfcController::class, 'index'])->name('home');

Route::get('/rfcs', [RfcController::class, 'index'])->name('rfcs.index');
Route::get('/rfcs/{rfc}', [RfcController::class, 'show'])->name('rfcs.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/rfcs/create', [RfcController::class, 'create'])->name('rfcs.create');
    Route::post('/rfcs', [RfcController::class, 'store'])->name('rfcs.store');
    Route::get('/rfcs/{rfc}/edit', [RfcController::class, 'edit'])->name('rfcs.edit');
    Route::put('/rfcs/{rfc}', [RfcController::class, 'update'])->name('rfcs.update');
    Route::delete('/rfcs/{rfc}', [RfcController::class, 'destroy'])->name('rfcs.destroy');
    Route::post('/rfc/{rfc}/comments', [CommentController::class, 'store'])->name('comments.store');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
