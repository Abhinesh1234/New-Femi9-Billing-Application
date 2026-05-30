<?php

use App\Models\Location;
use App\Models\Party;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * For every existing business party that has no linked Location yet,
     * create one warehouse-type Location tied via party_id.
     *
     * - Active parties   → is_active = true
     * - Soft-deleted parties → is_active = false  (excluded from stock queries)
     *
     * Runs in chunks of 100 to avoid memory pressure on large datasets.
     */
    public function up(): void
    {
        // IDs that already have a linked location (none right now, but safe to check)
        $alreadyLinked = Location::whereNotNull('party_id')->pluck('party_id')->flip();

        // Include soft-deleted parties so their locations are created (inactive)
        Party::withTrashed()
            ->where('party_type', 'business')
            ->chunkById(100, function ($parties) use ($alreadyLinked) {
                $rows = [];
                $now  = now();

                foreach ($parties as $party) {
                    if ($alreadyLinked->has($party->id)) continue;

                    $rows[] = [
                        'party_id'   => $party->id,
                        'name'       => $party->company_name ?: $party->display_name,
                        'type'       => 'warehouse',
                        'is_active'  => $party->deleted_at === null ? 1 : 0,
                        'is_primary' => 0,
                        'created_by' => $party->created_by,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }

                if (!empty($rows)) {
                    Location::insert($rows);
                }
            });
    }

    /**
     * Remove all locations that were created by this backfill
     * (i.e. those whose party_id points to a business party).
     * Only removes rows that have no ledger activity to avoid data loss.
     */
    public function down(): void
    {
        $businessPartyIds = Party::withTrashed()
            ->where('party_type', 'business')
            ->pluck('id');

        // Only delete locations that have no stock ledger entries attached
        Location::whereIn('party_id', $businessPartyIds)
            ->whereNotIn('id', \App\Models\ItemStockLedger::distinct()->pluck('location_id'))
            ->delete();
    }
};
