<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\PartyUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/**
 * Unified notification controller — works for all authenticated users.
 *
 * Scoping logic:
 *   PartyUser (party portal, party_scope_id set)  → notifiable_type=party,  notifiable_id=party_scope_id
 *   User (admin portal, any user_type)             → notifiable_type=user,   notifiable_id=user.id
 */
class NotificationController extends Controller
{
    // ── GET /api/notifications ────────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        try {
            [$type, $id] = $this->resolveScope($request);

            $notifications = AppNotification::where('notifiable_type', $type)
                ->where('notifiable_id', $id)
                ->orderByDesc('created_at')
                ->limit(50)
                ->get(['id', 'type', 'title', 'body', 'data', 'read_at', 'created_at']);

            return $this->successResponse(['data' => $notifications]);
        } catch (Throwable $e) {
            return $this->errorResponse('Failed to fetch notifications.', 500);
        }
    }

    // ── GET /api/notifications/unread-count ──────────────────────────────────
    public function unreadCount(Request $request): JsonResponse
    {
        try {
            [$type, $id] = $this->resolveScope($request);

            $count = AppNotification::where('notifiable_type', $type)
                ->where('notifiable_id', $id)
                ->whereNull('read_at')
                ->count();

            return $this->successResponse(['count' => $count]);
        } catch (Throwable $e) {
            return $this->errorResponse('Failed to fetch unread count.', 500);
        }
    }

    // ── POST /api/notifications/{id}/read ────────────────────────────────────
    public function markRead(Request $request, int $notificationId): JsonResponse
    {
        try {
            [$type, $id] = $this->resolveScope($request);

            $notification = AppNotification::where('id', $notificationId)
                ->where('notifiable_type', $type)
                ->where('notifiable_id', $id)
                ->first();

            if (!$notification) {
                return $this->errorResponse('Notification not found.', 404);
            }

            if (!$notification->read_at) {
                $notification->read_at = now();
                $notification->save();
            }

            return $this->successResponse(['message' => 'Marked as read.']);
        } catch (Throwable $e) {
            return $this->errorResponse('Failed to mark as read.', 500);
        }
    }

    // ── POST /api/notifications/read-all ─────────────────────────────────────
    public function markAllRead(Request $request): JsonResponse
    {
        try {
            [$type, $id] = $this->resolveScope($request);

            AppNotification::where('notifiable_type', $type)
                ->where('notifiable_id', $id)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);

            return $this->successResponse(['message' => 'All notifications marked as read.']);
        } catch (Throwable $e) {
            return $this->errorResponse('Failed to mark all as read.', 500);
        }
    }

    // ── Scope resolution ──────────────────────────────────────────────────────

    /** Returns [notifiable_type, notifiable_id] based on who is calling. */
    private function resolveScope(Request $request): array
    {
        $partyId = $request->attributes->get('party_scope_id');

        if ($partyId !== null) {
            // PartyUser authenticated via party portal
            return ['party', (int) $partyId];
        }

        // Regular User (admin, staff, or admin-portal party user)
        return ['user', (int) $request->user()->id];
    }
}
