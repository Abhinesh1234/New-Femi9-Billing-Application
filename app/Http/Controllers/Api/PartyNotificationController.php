<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class PartyNotificationController extends Controller
{
    // ── GET /api/party/notifications ───────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $partyId = $request->attributes->get('party_scope_id');
        if (!$partyId) {
            return $this->errorResponse('Forbidden.', 403);
        }

        try {
            $notifications = AppNotification::where('notifiable_type', 'party')
                ->where('notifiable_id', $partyId)
                ->orderByDesc('created_at')
                ->limit(50)
                ->get(['id', 'type', 'title', 'body', 'data', 'read_at', 'created_at']);

            return $this->successResponse(['data' => $notifications]);
        } catch (Throwable $e) {
            return $this->errorResponse('Failed to fetch notifications.', 500);
        }
    }

    // ── GET /api/party/notifications/unread-count ──────────────────────────────
    public function unreadCount(Request $request): JsonResponse
    {
        $partyId = $request->attributes->get('party_scope_id');
        if (!$partyId) {
            return $this->errorResponse('Forbidden.', 403);
        }

        try {
            $count = AppNotification::where('notifiable_type', 'party')
                ->where('notifiable_id', $partyId)
                ->whereNull('read_at')
                ->count();

            return $this->successResponse(['count' => $count]);
        } catch (Throwable $e) {
            return $this->errorResponse('Failed to fetch unread count.', 500);
        }
    }

    // ── POST /api/party/notifications/{id}/read ────────────────────────────────
    public function markRead(Request $request, int $notificationId): JsonResponse
    {
        $partyId = $request->attributes->get('party_scope_id');
        if (!$partyId) {
            return $this->errorResponse('Forbidden.', 403);
        }

        try {
            $notification = AppNotification::where('id', $notificationId)
                ->where('notifiable_type', 'party')
                ->where('notifiable_id', $partyId)
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
            return $this->errorResponse('Failed to mark notification as read.', 500);
        }
    }

    // ── POST /api/party/notifications/read-all ────────────────────────────────
    public function markAllRead(Request $request): JsonResponse
    {
        $partyId = $request->attributes->get('party_scope_id');
        if (!$partyId) {
            return $this->errorResponse('Forbidden.', 403);
        }

        try {
            AppNotification::where('notifiable_type', 'party')
                ->where('notifiable_id', $partyId)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);

            return $this->successResponse(['message' => 'All notifications marked as read.']);
        } catch (Throwable $e) {
            return $this->errorResponse('Failed to mark all as read.', 500);
        }
    }
}
