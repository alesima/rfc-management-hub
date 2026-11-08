<?php

use App\Http\Controllers\CommentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReviewerController;
use App\Http\Controllers\RfcController;
use App\Http\Controllers\RfcExportController;
use App\Http\Controllers\RfcStatusController;
use App\Http\Controllers\TeamMemberController;
use App\Http\Controllers\TeamSettingsController;
use App\Models\Rfc;
use App\Models\RfcTransition;
use App\Models\Team;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('rfcs.index');
    }

    return Inertia::render('Landing', [
        'stats' => [
            'rfcs' => Rfc::count(),
            'teams' => Team::count(),
            'decisions' => RfcTransition::whereIn('to_status', ['approved', 'rejected'])->count(),
        ],
    ]);
})->name('home');

// Breeze post-registration landing (controllers redirect here by default).
Route::get('/dashboard', fn () => redirect()->route('rfcs.index'))->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/rfcs', [RfcController::class, 'index'])->name('rfcs.index');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/rfcs/create', [RfcController::class, 'create'])->name('rfcs.create');
    Route::post('/rfcs', [RfcController::class, 'store'])->name('rfcs.store');
    Route::get('/rfcs/{rfc}/edit', [RfcController::class, 'edit'])->name('rfcs.edit');
    Route::put('/rfcs/{rfc}', [RfcController::class, 'update'])->name('rfcs.update');
    Route::delete('/rfcs/{rfc}', [RfcController::class, 'destroy'])->name('rfcs.destroy');
    Route::post('/rfcs/{rfc}/comments', [CommentController::class, 'store'])->name('comments.store');
    Route::post('/rfcs/{rfc}/vote', [RfcController::class, 'vote'])->name('rfcs.vote');
    Route::patch('/rfcs/{rfc}/status', [RfcStatusController::class, 'update'])->name('rfcs.status.update');
    Route::post('/teams/{team}/members', [TeamMemberController::class, 'store'])->name('teams.members.store');
    Route::delete('/teams/{team}/members/{user}', [TeamMemberController::class, 'destroy'])->name('teams.members.destroy');
    Route::patch('/teams/{team}/settings', [TeamSettingsController::class, 'update'])->name('teams.settings.update');
    Route::post('/rfcs/{rfc}/reviewers', [ReviewerController::class, 'store'])->name('rfcs.reviewers.store');
    Route::patch('/rfcs/{rfc}/reviewers/{user}', [ReviewerController::class, 'update'])->name('rfcs.reviewers.update');
    Route::delete('/rfcs/{rfc}/reviewers/{user}', [ReviewerController::class, 'destroy'])->name('rfcs.reviewers.destroy');
});

Route::get('/rfcs/{rfc}', [RfcController::class, 'show'])->name('rfcs.show');
Route::get('/rfcs/{rfc}/decision.md', [RfcExportController::class, 'adr'])->name('rfcs.decision.download');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
