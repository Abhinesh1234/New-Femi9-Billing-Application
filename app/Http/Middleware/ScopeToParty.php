<?php

namespace App\Http\Middleware;

use App\Models\PartyUser;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Must run AFTER auth:sanctum so that $request->user() is populated.
 *
 * When the authenticated user is a PartyUser, this middleware injects two
 * request attributes so downstream controllers can scope their queries without
 * touching the request input (which could be manipulated by the client):
 *
 *   party_scope_id  — the party_id the authenticated user belongs to
 *   party_user_id   — the PartyUser's own id (for created_by / audit fields)
 */
class ScopeToParty
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // When a stateful (session/cookie) request resolves a non-party user but a
        // party Bearer token is also present (e.g. same-domain test environment with
        // admin and party portal open in the same browser), explicitly look up the
        // party user from the token so party scope is applied correctly.
        if (!($user instanceof PartyUser)) {
            $bearerToken = $request->bearerToken();
            if ($bearerToken) {
                $tokenModel = \Laravel\Sanctum\PersonalAccessToken::findToken($bearerToken);
                if ($tokenModel && $tokenModel->tokenable instanceof PartyUser) {
                    $user = $tokenModel->tokenable;
                }
            }
        }

        if ($user instanceof PartyUser) {
            $request->attributes->set('party_scope_id', $user->party_id);
            $request->attributes->set('party_user_id',  $user->id);
        }

        return $next($request);
    }
}
