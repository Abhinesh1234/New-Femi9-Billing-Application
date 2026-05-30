<?php

use App\Models\Location;
use App\Models\Party;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * For every auto-created party location, set the name to
     * company_name (preferred) falling back to display_name.
     * Runs in chunks to avoid memory pressure on large datasets.
     */
    public function up(): void
    {
        Party::withTrashed()
            ->where('party_type', 'business')
            ->whereNotNull('company_name')
            ->chunkById(100, function ($parties) {
                foreach ($parties as $party) {
                    Location::where('party_id', $party->id)
                        ->update(['name' => $party->company_name]);
                }
            });
    }

    public function down(): void
    {
        Party::withTrashed()
            ->where('party_type', 'business')
            ->chunkById(100, function ($parties) {
                foreach ($parties as $party) {
                    Location::where('party_id', $party->id)
                        ->update(['name' => $party->display_name]);
                }
            });
    }
};
