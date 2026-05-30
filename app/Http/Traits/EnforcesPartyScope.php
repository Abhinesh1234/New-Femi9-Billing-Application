<?php

namespace App\Http\Traits;

use Illuminate\Support\Facades\DB;

/**
 * Provides helpers for controllers that must scope data to the authenticated party.
 *
 * When a PartyUser is authenticated, ScopeToParty middleware stores their party_id
 * as a request attribute. Company users (User model) have no attribute set, so all
 * helper methods return null / false for them — no filtering is applied.
 */
trait EnforcesPartyScope
{
    // ── Accessors ─────────────────────────────────────────────────────────────

    protected function partyScopeId(): ?int
    {
        return request()->attributes->get('party_scope_id');
    }

    /**
     * Returns the authenticated party's ID plus all descendant party IDs (self + children
     * + grandchildren…) via a recursive CTE. Returns an empty array for company users.
     */
    protected function partyScopeIds(): array
    {
        $rootId = $this->partyScopeId();
        if ($rootId === null) {
            return [];
        }

        $rows = DB::select("
            WITH RECURSIVE descendants AS (
                SELECT id FROM parties WHERE id = ? AND deleted_at IS NULL
                UNION ALL
                SELECT p.id FROM parties p
                INNER JOIN descendants d ON p.parent_party_id = d.id
                WHERE p.deleted_at IS NULL
            )
            SELECT id FROM descendants
        ", [$rootId]);

        return array_map('intval', array_column($rows, 'id'));
    }

    protected function isPartyUser(): bool
    {
        return $this->partyScopeId() !== null;
    }

    // ── Guards ────────────────────────────────────────────────────────────────

    /** Abort 403 when a party user tries to access a company-only endpoint. */
    protected function assertCompanyUser(string $msg = 'Access restricted to company users.'): void
    {
        if ($this->isPartyUser()) {
            abort(response()->json(['success' => false, 'message' => $msg], 403));
        }
    }

    /**
     * Abort 403 when a party user tries to access a record that does not belong to their
     * party hierarchy (self or any descendant).
     */
    protected function assertCustomerOwnership(int $recordCustomerId): void
    {
        if ($this->isPartyUser() && !in_array($recordCustomerId, $this->partyScopeIds(), true)) {
            abort(response()->json(['success' => false, 'message' => 'Access denied.'], 403));
        }
    }

    // ── Query helpers ─────────────────────────────────────────────────────────

    /**
     * Apply a whereIn('customer_id', [...]) scope when the caller is a party user.
     * Includes self + all descendants so a distributor sees its sub-distributors' data.
     */
    protected function applyCustomerScope(object $query, string $column = 'customer_id'): object
    {
        $ids = $this->partyScopeIds();
        if (!empty($ids)) {
            $query->whereIn($column, $ids);
        }
        return $query;
    }

    /**
     * Force customer_id in validated data to the party's own ID when called by a party user.
     * Also strips any attempt by the party user to set a different customer.
     */
    protected function resolveCustomerId(array &$data, string $column = 'customer_id'): void
    {
        $id = $this->partyScopeId();
        if ($id !== null) {
            $data[$column] = $id;
        }
    }
}
