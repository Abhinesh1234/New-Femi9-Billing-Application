<?php

namespace App\Services;

use App\Models\AppNotification;
use App\Models\Item;
use App\Models\Location;
use App\Models\PartyItemReorderPoint;
use App\Models\Party;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class ReorderNotificationService
{
    /**
     * Entry point called after every stock write.
     *
     * Branches on whether the location is party-owned or company-owned:
     *   Party location  → check party's own reorder point → notify party (email if set + bell)
     *   Company location → check item's global reorder_point → notify admin (email from settings + bell)
     */
    public function checkAndNotify(int $itemId, int $locationId, float $newAvailable): void
    {
        try {
            $location = Location::select('id', 'party_id')->find($locationId);
            if (!$location) return;

            if ($location->party_id !== null) {
                $this->notifyParty($itemId, (int) $location->party_id, $locationId, $newAvailable);
            } else {
                $this->notifyAdmin($itemId, $locationId, $newAvailable);
            }
        } catch (Throwable $e) {
            Log::error('[ReorderNotification] checkAndNotify failed', [
                'item_id'     => $itemId,
                'location_id' => $locationId,
                'error'       => $e->getMessage(),
            ]);
        }
    }

    // ── Party-owned location ──────────────────────────────────────────────────

    private function notifyParty(int $itemId, int $partyId, int $locationId, float $newAvailable): void
    {
        // Party must have set their own reorder point for this item
        $reorderRow = PartyItemReorderPoint::where('party_id', $partyId)
            ->where('item_id', $itemId)
            ->first();

        if (!$reorderRow) return;

        $reorderPoint = (float) $reorderRow->reorder_point;

        if ($newAvailable > $reorderPoint) return;

        // 24-hour debounce per party+item
        if ($reorderRow->last_notified_at && $reorderRow->last_notified_at->diffInHours(now()) < 24) {
            return;
        }

        $item  = Item::withTrashed()->select('id', 'name', 'sku')->find($itemId);
        $party = Party::select('id', 'display_name', 'email')->find($partyId);

        if (!$item || !$party) return;

        $itemLabel = $item->name . ($item->sku ? " ({$item->sku})" : '');
        $body      = "Stock for \"{$itemLabel}\" has dropped to {$newAvailable}, "
                   . "which is at or below your reorder point of {$reorderPoint}.";

        // Update debounce timestamp
        $reorderRow->last_notified_at = now();
        $reorderRow->save();

        // Always create in-app notification
        AppNotification::create([
            'notifiable_type' => 'party',
            'notifiable_id'   => $partyId,
            'type'            => 'reorder_alert',
            'title'           => 'Low Stock Alert',
            'body'            => $body,
            'data'            => [
                'item_id'       => $itemId,
                'item_name'     => $item->name,
                'available'     => $newAvailable,
                'reorder_point' => $reorderPoint,
                'location_id'   => $locationId,
            ],
            'read_at' => null,
        ]);

        // Send email only if party has an email address
        if (!empty($party->email)) {
            $this->sendEmail(
                $party->email,
                $party->display_name ?? 'Valued Customer',
                $itemLabel,
                $newAvailable,
                $reorderPoint,
                'your'
            );
        }

        Log::info('[ReorderNotification] Party alert sent', [
            'party_id'      => $partyId,
            'item_id'       => $itemId,
            'available'     => $newAvailable,
            'reorder_point' => $reorderPoint,
            'emailed'       => !empty($party->email),
        ]);
    }

    // ── Company-owned location (admin notification) ───────────────────────────

    private function notifyAdmin(int $itemId, int $locationId, float $newAvailable): void
    {
        // Load product settings; check if feature is enabled
        $settings = app(SettingService::class)->get('products');

        if (!($settings['notify_reorder_point'] ?? false)) return;

        $notifyEmail = $settings['notify_to_email'] ?? null;

        // Get item's global reorder point
        $item = Item::withTrashed()->select('id', 'name', 'sku', 'reorder_point')->find($itemId);
        if (!$item || $item->reorder_point === null) return;

        $reorderPoint = (float) $item->reorder_point;
        if ($newAvailable > $reorderPoint) return;

        // 24-hour debounce per item (cache-based, no extra DB table needed)
        $cacheKey = "admin_reorder_notified:item:{$itemId}";
        if (Cache::has($cacheKey)) return;
        Cache::put($cacheKey, true, now()->addHours(24));

        $itemLabel = $item->name . ($item->sku ? " ({$item->sku})" : '');
        $body      = "Stock for \"{$itemLabel}\" has dropped to {$newAvailable}, "
                   . "which is at or below the reorder point of {$reorderPoint}.";

        // Create in-app notification for every super_admin and admin user
        $adminIds = User::whereIn('user_type', ['super_admin', 'admin'])
            ->where('is_active', true)
            ->pluck('id');

        foreach ($adminIds as $userId) {
            AppNotification::create([
                'notifiable_type' => 'user',
                'notifiable_id'   => $userId,
                'type'            => 'reorder_alert',
                'title'           => 'Low Stock Alert',
                'body'            => $body,
                'data'            => [
                    'item_id'       => $itemId,
                    'item_name'     => $item->name,
                    'available'     => $newAvailable,
                    'reorder_point' => $reorderPoint,
                    'location_id'   => $locationId,
                ],
                'read_at' => null,
            ]);
        }

        // Send email to the address configured in product settings
        if (!empty($notifyEmail)) {
            $this->sendEmail(
                $notifyEmail,
                'Admin',
                $itemLabel,
                $newAvailable,
                $reorderPoint,
                'the configured'
            );
        }

        Log::info('[ReorderNotification] Admin alert sent', [
            'item_id'       => $itemId,
            'location_id'   => $locationId,
            'available'     => $newAvailable,
            'reorder_point' => $reorderPoint,
            'admin_count'   => $adminIds->count(),
            'emailed_to'    => $notifyEmail ?? 'none',
        ]);
    }

    // ── Shared email helper ───────────────────────────────────────────────────

    private function sendEmail(
        string $toEmail,
        string $toName,
        string $itemLabel,
        float $available,
        float $reorderPoint,
        string $pointPronoun = 'your'
    ): void {
        try {
            Mail::send([], [], function ($message) use ($toEmail, $toName, $itemLabel, $available, $reorderPoint, $pointPronoun) {
                $message
                    ->to($toEmail, $toName)
                    ->subject('Low Stock Alert: ' . $itemLabel)
                    ->html(
                        "<p>Dear {$toName},</p>" .
                        "<p>This is an automated alert to inform you that the stock for <strong>{$itemLabel}</strong> " .
                        "has dropped to <strong>{$available}</strong>, which is at or below {$pointPronoun} configured " .
                        "reorder point of <strong>{$reorderPoint}</strong>.</p>" .
                        "<p>Please arrange a replenishment order at your earliest convenience.</p>" .
                        "<br><p>Thank you,<br>Inventory System</p>"
                    );
            });
        } catch (Throwable $e) {
            Log::warning('[ReorderNotification] Email send failed', [
                'to'    => $toEmail,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
