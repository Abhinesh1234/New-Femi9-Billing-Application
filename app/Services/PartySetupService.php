<?php

namespace App\Services;

use App\Models\DistributionLocationNode;
use App\Models\Location;
use App\Models\Party;
use App\Models\PartyUser;

class PartySetupService
{
    // ── Stock locations ───────────────────────────────────────────────────────

    /**
     * Create warehouse stock location(s) for a newly created party.
     * Separate location_type → one location per assigned node.
     * Unified (or null) → one combined location.
     */
    public function createStockLocations(
        Party $party,
        array $nodeIds,
        ?int $createdBy,
        ?array $billingAddress = null,
        ?array $shippingAddress = null,
    ): void {
        if (!$this->qualifies($party)) {
            return;
        }

        $nodes = empty($nodeIds)
            ? collect()
            : DistributionLocationNode::whereIn('id', array_unique($nodeIds))->get()->keyBy('id');

        $addrData = [];
        if ($billingAddress && count(array_filter($billingAddress)) > 0) {
            $addrData['address'] = $billingAddress;
        }
        if ($shippingAddress && count(array_filter($shippingAddress)) > 0) {
            $addrData['shipping_address'] = $shippingAddress;
        }

        if ($party->location_type === 'separate' && $nodes->isNotEmpty()) {
            $first = true;
            foreach ($nodeIds as $nodeId) {
                $node = $nodes->get($nodeId);
                if (!$node) continue;
                Location::create(array_merge([
                    'party_id'                      => $party->id,
                    'name'                          => $party->display_name . ' - ' . $node->name,
                    'type'                          => 'warehouse',
                    'distribution_location_node_id' => $node->id,
                    'is_primary'                    => $first,
                    'is_active'                     => true,
                    'created_by'                    => $createdBy,
                ], $addrData));
                $first = false;
            }
            return;
        }

        // Unified: one location, suffixed with first node name if available
        $firstNode = $nodes->first();
        Location::create(array_merge([
            'party_id'                      => $party->id,
            'name'                          => $firstNode
                                                ? $party->display_name . ' - ' . $firstNode->name
                                                : $party->display_name,
            'type'                          => 'warehouse',
            'distribution_location_node_id' => $firstNode?->id,
            'is_primary'                    => true,
            'is_active'                     => true,
            'created_by'                    => $createdBy,
        ], $addrData));
    }

    /**
     * Re-sync stock locations when a party is updated.
     *
     * Pass $nodeIds as the new list when nodes changed in this request,
     * or null when the node list was not part of the update payload
     * (in which case only names are refreshed).
     */
    public function syncStockLocations(Party $party, ?array $nodeIds, ?int $updatedBy): void
    {
        if (!$this->qualifies($party)) {
            // Party no longer qualifies — deactivate and soft-delete so invoice history is preserved
            Location::where('party_id', $party->id)->whereNull('deleted_at')
                ->update(['is_active' => false]);
            Location::where('party_id', $party->id)->whereNull('deleted_at')->delete();
            return;
        }

        if ($nodeIds === null) {
            // Nodes and type unchanged — just rename active locations to match display_name
            foreach (Location::where('party_id', $party->id)->whereNull('deleted_at')->get() as $loc) {
                $nodeName = $loc->distributionLocationNode?->name;
                $loc->update([
                    'name' => $nodeName
                        ? $party->display_name . ' - ' . $nodeName
                        : $party->display_name,
                ]);
            }
            return;
        }

        // Nodes or location_type changed — deactivate + soft-delete existing locations
        // so invoices that reference them still resolve the name via withTrashed queries.
        Location::where('party_id', $party->id)->whereNull('deleted_at')
            ->update(['is_active' => false]);
        Location::where('party_id', $party->id)->whereNull('deleted_at')->delete();

        $this->createStockLocations($party, $nodeIds, $updatedBy);
    }

    // ── Portal user ───────────────────────────────────────────────────────────

    /**
     * Create a PartyUser portal account with an auto-generated username.
     * Username format: first4(first_name) + '@' + first4(digits of mobile)
     * Password: full mobile number (plaintext — hashed by model cast).
     */
    public function createPortalUser(Party $party, ?int $createdBy): ?PartyUser
    {
        if (!$this->qualifies($party)) {
            return null;
        }

        if (PartyUser::where('party_id', $party->id)->exists()) {
            return null;
        }

        return PartyUser::create([
            'party_id'  => $party->id,
            'role_id'   => $party->role_id,
            'name'      => $party->display_name,
            'username'  => $party->mobile,
            'mobile'    => $party->mobile,
            'password'  => $party->mobile, // hashed by model cast — temporary, user should change
            'is_active' => true,
        ]);
    }

    /**
     * Keep the portal user's role and display name in sync after an update.
     */
    public function syncPortalUser(Party $party): void
    {
        $user = PartyUser::where('party_id', $party->id)->first();
        if (!$user) return;

        $user->update([
            'role_id' => $party->role_id,
            'name'    => $party->display_name,
        ]);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private function qualifies(Party $party): bool
    {
        return $party->party_type === 'business'
            || ($party->party_type === 'individual' && $party->enable_portal);
    }

}
