<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\InvoiceApprovalApprover;
use App\Models\InvoiceApprovalHierarchyLevel;
use App\Models\InvoiceApprovalSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Throwable;

class InvoiceApprovalController extends Controller
{
    // ── GET /api/approvals/invoices ───────────────────────────────────────────

    public function show(Request $request): JsonResponse
    {
        try {
            $settings = InvoiceApprovalSetting::first();

            $approvers = InvoiceApprovalApprover::with('user:id,name,email,avatar')
                ->orderBy('sort_order')
                ->get()
                ->map(fn ($a) => $a->user)
                ->filter()
                ->values();

            $hierarchy = InvoiceApprovalHierarchyLevel::with('user:id,name,email,avatar')
                ->orderBy('level_order')
                ->get()
                ->map(fn ($h) => [
                    'id'          => $h->id,
                    'level_order' => $h->level_order,
                    'user'        => $h->user,
                ]);

            return $this->successResponse([
                'data' => [
                    'approval_type'    => $settings?->approval_type    ?? 'no_approval',
                    'notify_on_submit' => $settings?->notify_on_submit  ?? false,
                    'notify_who'       => $settings?->notify_who        ?? 'non_approver',
                    'notify_email'     => $settings?->notify_email      ?? null,
                    'notify_submitter' => $settings?->notify_submitter  ?? false,
                    'approvers'        => $approvers,
                    'hierarchy'        => $hierarchy,
                ],
            ]);
        } catch (Throwable $e) {
            $this->logException('InvoiceApprovalController::show', $e, $this->buildCtx($request, 'InvoiceApprovalController::show'));
            return $this->errorResponse('Failed to fetch approval settings.', 500);
        }
    }

    // ── PUT /api/approvals/invoices ───────────────────────────────────────────

    public function update(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'InvoiceApprovalController::update');

        $validated = $request->validate([
            'approval_type'       => ['required', Rule::in(['no_approval', 'simple_approval', 'multi_level'])],
            'notify_on_submit'    => ['required', 'boolean'],
            'notify_who'          => ['nullable', Rule::in(['non_approver', 'all', 'specific_email'])],
            'notify_email'        => ['nullable', 'email', 'max:255'],
            'notify_submitter'    => ['required', 'boolean'],
            'approver_ids'        => ['sometimes', 'array'],
            'approver_ids.*'      => ['integer', 'exists:users,id'],
            'hierarchy'           => ['sometimes', 'array'],
            'hierarchy.*.user_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        try {
            DB::transaction(function () use ($validated, $request) {
                $old = InvoiceApprovalSetting::first();

                $settings = InvoiceApprovalSetting::updateOrCreate([], [
                    'approval_type'    => $validated['approval_type'],
                    'notify_on_submit' => $validated['notify_on_submit'],
                    'notify_who'       => $validated['notify_who'] ?? null,
                    'notify_email'     => $validated['notify_email'] ?? null,
                    'notify_submitter' => $validated['notify_submitter'],
                ]);

                InvoiceApprovalApprover::query()->delete();
                if ($validated['approval_type'] === 'simple_approval' && !empty($validated['approver_ids'])) {
                    foreach ($validated['approver_ids'] as $order => $userId) {
                        InvoiceApprovalApprover::create(['user_id' => $userId, 'sort_order' => $order]);
                    }
                }

                InvoiceApprovalHierarchyLevel::query()->delete();
                if ($validated['approval_type'] === 'multi_level' && !empty($validated['hierarchy'])) {
                    foreach ($validated['hierarchy'] as $idx => $level) {
                        InvoiceApprovalHierarchyLevel::create([
                            'level_order' => $idx + 1,
                            'user_id'     => $level['user_id'] ?? null,
                        ]);
                    }
                }

                try {
                    AuditLog::create([
                        'auditable_type' => 'InvoiceApprovalSetting',
                        'auditable_id'   => $settings->id,
                        'event'          => 'updated',
                        'user_id'        => $request->user()?->id,
                        'ip_address'     => $request->ip(),
                        'user_agent'     => $request->userAgent(),
                        'old_values'     => $old?->toArray(),
                        'new_values'     => $settings->toArray(),
                    ]);
                } catch (Throwable $auditErr) { Log::error("[Audit] Failed to write audit log", ["error" => $auditErr->getMessage()]); }
            });

            return $this->successResponse(['message' => 'Approval settings saved successfully.']);
        } catch (Throwable $e) {
            $this->logException('InvoiceApprovalController::update', $e, $ctx);
            return $this->errorResponse('Failed to save approval settings.', 500);
        }
    }
}
