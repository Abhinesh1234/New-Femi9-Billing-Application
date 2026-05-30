<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PartyComment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PartyCommentController extends Controller
{
    // GET /api/parties/{partyId}/comments
    public function index(int $partyId): JsonResponse
    {
        $comments = PartyComment::where('party_id', $partyId)
            ->with('user:id,name')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn($c) => [
                'id'         => $c->id,
                'content'    => $c->content,
                'created_at' => $c->created_at,
                'user'       => $c->user ? ['id' => $c->user->id, 'name' => $c->user->name] : null,
            ]);

        return response()->json(['success' => true, 'data' => $comments]);
    }

    // POST /api/parties/{partyId}/comments
    public function store(Request $request, int $partyId): JsonResponse
    {
        $request->validate(['content' => 'required|string|max:5000']);

        $comment = PartyComment::create([
            'party_id' => $partyId,
            'user_id'  => Auth::id(),
            'content'  => $request->input('content'),
        ]);

        $comment->load('user:id,name');

        return response()->json([
            'success' => true,
            'message' => 'Comment added.',
            'data'    => [
                'id'         => $comment->id,
                'content'    => $comment->content,
                'created_at' => $comment->created_at,
                'user'       => $comment->user ? ['id' => $comment->user->id, 'name' => $comment->user->name] : null,
            ],
        ], 201);
    }

    // DELETE /api/parties/{partyId}/comments/{commentId}
    public function destroy(int $partyId, int $commentId): JsonResponse
    {
        $comment = PartyComment::where('party_id', $partyId)->findOrFail($commentId);

        // Only owner can delete
        if ($comment->user_id !== Auth::id()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $comment->delete();

        return response()->json(['success' => true, 'message' => 'Comment deleted.']);
    }
}
