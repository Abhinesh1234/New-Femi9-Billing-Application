<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Usage: ->middleware('perm:module,action[,allow_party]')
     *
     * module may be pipe-separated to allow ANY match:
     *   ->middleware('perm:items|composite_items,view,allow_party')
     *   passes if the user has items,view OR composite_items,view
     *
     * allow_party: party portal users bypass the check entirely.
     */
    public function handle(Request $request, Closure $next, string $module, string $action = 'view', string $extra = ''): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        // Routes marked allow_party bypass the permission check for party portal users
        if ($extra === 'allow_party' && $user instanceof \App\Models\PartyUser) {
            return $next($request);
        }

        // Support pipe-separated modules — pass if the user has the action on ANY of them
        $modules = explode('|', $module);
        foreach ($modules as $mod) {
            if ($user->hasPermission($action, trim($mod))) {
                return $next($request);
            }
        }

        return response()->json(['success' => false, 'message' => 'You do not have permission to perform this action.'], 403);
    }
}
