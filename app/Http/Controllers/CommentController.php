<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Rfc;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function store(Request $request, Rfc $rfc)
    {
        $validated = $request->validate([
            'content' => 'required',
        ]);

        $rfc->comments()->create([
            'content' => $validated['content'],
            'user_id' => Auth::id(),
        ]);

        return redirect()->route('rfcs.show', $rfc);
    }

    public function destroy(Comment $comment)
    {
        $comment->delete();

        return redirect()->route('rfcs.show', $comment->rfc);
    }
}
