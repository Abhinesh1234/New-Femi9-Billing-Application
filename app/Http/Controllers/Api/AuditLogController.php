<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\AuditLog;
use App\Models\Brand;
use App\Models\Category;
use App\Models\GstRate;
use App\Models\HsnCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class AuditLogController extends Controller
{
    /**
     * GET /api/audit-logs
     * Global feed — filterable by type, id, user, event.
     */
    public function index(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'AuditLogController::index');

        try {
            $query = AuditLog::with('user:id,name,phone')
                ->when($request->query('type'),    fn($q, $v) => $q->where('auditable_type', $v))
                ->when($request->query('id'),      fn($q, $v) => $q->where('auditable_id', $v))
                ->when($request->query('user_id'), fn($q, $v) => $q->byUser($v))
                ->when($request->query('event'),   fn($q, $v) => $q->event($v))
                ->when($request->query('from'),    fn($q, $v) => $q->whereDate('created_at', '>=', $v))
                ->when($request->query('to'),      fn($q, $v) => $q->whereDate('created_at', '<=', $v))
                ->latest('created_at');

            $perPage = min((int) $request->query('per_page', 25), 100);

            return $this->successResponse(['data' => $query->paginate($perPage)]);

        } catch (Throwable $e) {
            $this->logException('AuditLogController::index', $e, $ctx);
            return $this->errorResponse('Failed to fetch audit logs.', 500);
        }
    }

    /**
     * GET /api/audit-logs/{type}/{id}
     * Full history of a single record.
     */
    public function forRecord(Request $request, string $type, int $id): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'AuditLogController::forRecord', [
            'auditable_type' => $type,
            'auditable_id'   => $id,
        ]);

        try {
            $logs = AuditLog::with('user:id,name,phone')
                ->forModel($type, $id)
                ->when($request->query('event'), fn($q, $v) => $q->event($v))
                ->latest('created_at')
                ->paginate(min((int) $request->query('per_page', 25), 100));

            if ($type === 'items') {
                $this->resolveItemRefs($logs->items());
            }

            return $this->successResponse(['data' => $logs]);

        } catch (Throwable $e) {
            $this->logException('AuditLogController::forRecord', $e, $ctx);
            return $this->errorResponse('Failed to fetch audit logs.', 500);
        }
    }

    /**
     * Replace raw FK IDs inside the `refs` JSON column with human-readable names.
     * Operates directly on the AuditLog model instances (no DB writes).
     *
     * @param AuditLog[] $logItems
     */
    private function resolveItemRefs(array $logItems): void
    {
        // ── 1. Collect all unique IDs across every log entry ─────────────────
        $ids = array_fill_keys([
            'brand_id', 'category_id', 'hsn_code_id',
            'gst_rate_id', 'sales_account_id', 'purchase_account_id', 'inventory_account_id',
        ], []);

        foreach ($logItems as $log) {
            foreach (['old_values', 'new_values'] as $prop) {
                $vals = $log->{$prop};
                if (! is_array($vals) || ! array_key_exists('refs', $vals)) continue;
                $refs = is_string($vals['refs'])
                    ? (json_decode($vals['refs'], true) ?? [])
                    : ($vals['refs'] ?? []);
                foreach (array_keys($ids) as $key) {
                    if (! empty($refs[$key])) {
                        $ids[$key][] = (int) $refs[$key];
                    }
                }
            }
        }

        // ── 2. Batch-fetch display names (one query per model type) ──────────
        $accountIds = array_unique(array_merge(
            $ids['sales_account_id'],
            $ids['purchase_account_id'],
            $ids['inventory_account_id']
        ));

        // Use withTrashed so IDs from deleted records still resolve to names
        $nameMap = [
            'brand_id'    => Brand::withTrashed()->whereIn('id',    array_unique($ids['brand_id']))->pluck('name', 'id'),
            'category_id' => Category::withTrashed()->whereIn('id', array_unique($ids['category_id']))->pluck('name', 'id'),
            'hsn_code_id' => HsnCode::withTrashed()->whereIn('id',  array_unique($ids['hsn_code_id']))->pluck('code', 'id'),
            'gst_rate_id' => GstRate::withTrashed()->whereIn('id',  array_unique($ids['gst_rate_id']))->pluck('label', 'id'),
            'accounts'    => Account::withTrashed()->whereIn('id',  $accountIds)->pluck('name', 'id'),
        ];

        $accountKeys = ['sales_account_id', 'purchase_account_id', 'inventory_account_id'];

        // ── 3. Substitute IDs → names in each log entry ──────────────────────
        foreach ($logItems as $log) {
            foreach (['old_values', 'new_values'] as $prop) {
                $vals = $log->{$prop};
                if (! is_array($vals) || ! array_key_exists('refs', $vals)) continue;

                $refs = is_string($vals['refs'])
                    ? (json_decode($vals['refs'], true) ?? [])
                    : ($vals['refs'] ?? []);

                foreach ($refs as $key => $rawId) {
                    if (empty($rawId)) continue;
                    $id = (int) $rawId;
                    if (array_key_exists($key, $nameMap) && isset($nameMap[$key][$id])) {
                        $refs[$key] = $nameMap[$key][$id];
                    } elseif (in_array($key, $accountKeys) && isset($nameMap['accounts'][$id])) {
                        $refs[$key] = $nameMap['accounts'][$id];
                    }
                }

                $vals['refs'] = $refs;
                $log->{$prop} = $vals;
            }
        }
    }
}
