<?php

namespace App\Services;

use App\Models\DistributionCategory;
use App\Models\Party;
use App\Models\PartyIdSequence;
use Illuminate\Support\Facades\DB;

class PartyIdService
{
    /**
     * Generate the next party ID atomically.
     *
     * The sequence number is based on how many active (non-deleted) parties
     * currently exist in the same category, so the first stockist always
     * gets -0001 even if previous parties have moved to other categories.
     *
     * IDs are never reassigned to a different party — any ID that is currently
     * in use OR stored in any party's history is treated as reserved.
     *
     * The sequence table row is locked to prevent concurrent duplicates.
     */
    public function generate(string $partyType, string $categoryCode): string
    {
        return DB::transaction(function () use ($partyType, $categoryCode) {
            $sequenceKey = $this->resolveKey($partyType, $categoryCode);

            $seq = PartyIdSequence::where('sequence_key', $sequenceKey)
                ->lockForUpdate()
                ->first();

            if (!$seq) {
                $seq = PartyIdSequence::create([
                    'sequence_key' => $sequenceKey,
                    'prefix'       => $this->resolvePrefix($partyType, $categoryCode),
                    'last_number'  => 0,
                    'pad_length'   => $this->resolvePadLength($partyType),
                    'updated_at'   => now(),
                ]);
            }

            $prefix    = $seq->prefix;
            $padLength = $seq->pad_length;

            // Start from current active count in this category (1-based)
            $next = $this->countActiveInCategory($partyType, $categoryCode) + 1;

            // Skip any ID already in use OR reserved in any party's history
            do {
                $candidate = $prefix . '-' . str_pad($next, $padLength, '0', STR_PAD_LEFT);
                if ($this->isReserved($candidate)) $next++;
                else break;
            } while (true);

            // Keep last_number at the highest value ever assigned
            if ($next > $seq->last_number) {
                PartyIdSequence::where('sequence_key', $sequenceKey)
                    ->update(['last_number' => $next, 'updated_at' => now()]);
            }

            return $candidate;
        });
    }

    /**
     * Preview the next ID that would be issued without consuming the sequence.
     * Uses the same count-based logic as generate() so the preview is accurate.
     */
    public function preview(string $partyType, string $categoryCode): string
    {
        $sequenceKey = $this->resolveKey($partyType, $categoryCode);
        $seq         = PartyIdSequence::where('sequence_key', $sequenceKey)->first();

        $prefix    = $seq?->prefix    ?? $this->resolvePrefix($partyType, $categoryCode);
        $padLength = $seq?->pad_length ?? $this->resolvePadLength($partyType);

        $next = $this->countActiveInCategory($partyType, $categoryCode) + 1;

        do {
            $candidate = $prefix . '-' . str_pad($next, $padLength, '0', STR_PAD_LEFT);
            if ($this->isReserved($candidate)) $next++;
            else break;
        } while (true);

        return $candidate;
    }

    // ── Private ───────────────────────────────────────────────────────────────

    private function resolveKey(string $partyType, string $categoryCode): string
    {
        $suffix = $partyType === 'individual' ? '_I' : '_B';
        return strtoupper($categoryCode) . $suffix;
    }

    private function resolvePrefix(string $partyType, string $categoryCode): string
    {
        if ($partyType === 'individual') {
            return match (strtoupper($categoryCode)) {
                'CUSTOMER' => 'CUS-F',
                'SHOP'     => 'SHOP-F',
                default    => strtoupper($categoryCode) . '-F',
            };
        }
        return strtoupper($categoryCode);
    }

    private function resolvePadLength(string $partyType): int
    {
        return $partyType === 'individual' ? 3 : 4;
    }

    /**
     * Returns true if the given party_id is already in use (active or soft-deleted)
     * OR reserved inside any party's party_id_history map.
     *
     * This ensures a historical ID is never reassigned to a different party.
     */
    private function isReserved(string $partyId): bool
    {
        // Check current party_id column (active + soft-deleted)
        if (Party::withTrashed()->where('party_id', $partyId)->exists()) {
            return true;
        }

        // Check party_id_history JSON values via MySQL JSON_SEARCH
        return DB::table('parties')
            ->whereRaw("JSON_SEARCH(party_id_history, 'one', ?) IS NOT NULL", [$partyId])
            ->exists();
    }

    /**
     * Count currently active (non-deleted) parties in a given type+category.
     */
    private function countActiveInCategory(string $partyType, string $categoryCode): int
    {
        $category = DistributionCategory::where('code', strtoupper($categoryCode))->first();

        return $category
            ? Party::whereNull('deleted_at')
                ->where('distribution_category_id', $category->id)
                ->count()
            : 0;
    }
}
