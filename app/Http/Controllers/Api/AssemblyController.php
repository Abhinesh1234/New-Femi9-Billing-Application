<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAssemblyRequest;
use App\Models\Assembly;
use App\Services\StockMovementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Throwable;

class AssemblyController extends Controller
{
    private const DETAIL_WITH = ['compositeItem:id,name,sku,image', 'location:id,name', 'items'];

    // ────────────────────────────────────────────────────────────────────────────
    // READ
    // ────────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/assemblies
     */
    public function index(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'AssemblyController::index');

        try {
            $query = Assembly::with(['compositeItem:id,name,sku', 'location:id,name'])
                ->when(
                    $request->filled('search'),
                    fn ($q) => $q->where('assembly_number', 'like', '%' . $request->query('search') . '%')
                )
                ->when(
                    $request->filled('status'),
                    fn ($q) => $q->where('status', $request->query('status'))
                )
                ->when(
                    $request->boolean('trashed'),
                    fn ($q) => $q->onlyTrashed()
                )
                ->latest();

            $perPage    = max(1, min((int) $request->query('per_page', 20), 500));
            $assemblies = $query->paginate($perPage);

            return $this->successResponse([
                'data' => $assemblies->items(),
                'meta' => [
                    'current_page' => $assemblies->currentPage(),
                    'last_page'    => $assemblies->lastPage(),
                    'total'        => $assemblies->total(),
                    'per_page'     => $assemblies->perPage(),
                ],
            ]);

        } catch (Throwable $e) {
            $this->logException('AssemblyController::index', $e, $ctx);
            return $this->errorResponse('Failed to fetch assemblies.', 500);
        }
    }

    /**
     * GET /api/assemblies/{assembly}
     */
    public function show(Request $request, int $assembly): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'AssemblyController::show', ['assembly_id' => $assembly]);

        try {
            $record = Assembly::with(self::DETAIL_WITH)->findOrFail($assembly);
            return $this->successResponse(['data' => $record]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Assembly not found.', 404);
        } catch (Throwable $e) {
            $this->logException('AssemblyController::show', $e, $ctx);
            return $this->errorResponse('Failed to fetch assembly.', 500);
        }
    }

    /**
     * GET /api/assemblies/next-number
     */
    public function nextNumber(): JsonResponse
    {
        $max = Assembly::withTrashed()->count();
        return $this->successResponse([
            'data' => ['assembly_number' => 'ASM-' . str_pad($max + 1, 6, '0', STR_PAD_LEFT)],
        ]);
    }

    // ────────────────────────────────────────────────────────────────────────────
    // WRITE
    // ────────────────────────────────────────────────────────────────────────────

    /**
     * POST /api/assemblies
     * Creates the assembly record, snapshots components, and moves stock atomically.
     */
    public function store(StoreAssemblyRequest $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'AssemblyController::store');
        Log::info('[AssemblyController] Store started', $ctx);

        try {
            $data         = $request->validated();
            $componentRows = $data['items'];
            unset($data['items']);

            $data['assembly_number'] = $this->generateAssemblyNumber();
            $data['status']          = 'completed';
            $data['created_by']      = $request->user()?->id;
            $qtyToAssemble           = (float) $data['quantity_to_assemble'];

            DB::beginTransaction();

            $assembly = Assembly::create($data);

            foreach ($componentRows as $row) {
                $qtyRequired = (float) $row['quantity_required'];
                $assembly->items()->create([
                    'item_id'           => (int) $row['item_id'],
                    'item_name'         => $row['item_name'],
                    'item_unit'         => $row['item_unit'] ?? null,
                    'quantity_required' => $qtyRequired,
                    'total_quantity'    => round($qtyRequired * $qtyToAssemble, 4),
                    'cost_price'        => isset($row['cost_price']) ? (float) $row['cost_price'] : 0,
                ]);
            }

            $assembly->load('items');

            // Stock movements — onAssemblyCreated validates stock, then writes.
            // If validation fails it throws ValidationException inside the transaction.
            (new StockMovementService())->onAssemblyCreated($assembly, $request->user()?->id);

            DB::commit();

            Log::info('[AssemblyController] Store success', array_merge($ctx, ['assembly_id' => $assembly->id]));

            return $this->successResponse([
                'message' => 'Assembly completed successfully.',
                'data'    => $assembly->load(self::DETAIL_WITH),
            ], 201);

        } catch (ValidationException $e) {
            DB::rollBack();
            return $this->errorResponse($e->errors()['stock'][0] ?? 'Insufficient stock.', 422);
        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('AssemblyController::store', $e, $ctx);
            return $this->errorResponse('Failed to save assembly. Please try again.', 500);
        }
    }

    /**
     * POST /api/assemblies/{assembly}/cancel
     * Marks the assembly as cancelled and reverses all stock movements.
     */
    public function cancel(Request $request, int $assembly): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'AssemblyController::cancel', ['assembly_id' => $assembly]);

        try {
            $record = Assembly::where('status', 'completed')->findOrFail($assembly);

            DB::beginTransaction();

            $record->update([
                'status'       => 'cancelled',
                'cancelled_by' => $request->user()?->id,
                'cancelled_at' => Carbon::now(),
            ]);

            (new StockMovementService())->onAssemblyCancelled($record, $request->user()?->id);

            DB::commit();

            Log::info('[AssemblyController] Cancelled', $ctx);
            return $this->successResponse(['message' => 'Assembly cancelled and stock reversed.']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Assembly not found or already cancelled.', 404);
        } catch (Throwable $e) {
            DB::rollBack();
            $this->logException('AssemblyController::cancel', $e, $ctx);
            return $this->errorResponse('Failed to cancel assembly.', 500);
        }
    }

    /**
     * DELETE /api/assemblies/{assembly}
     * Permanently deletes an assembly record.
     * Only cancelled assemblies may be deleted (stock already reversed).
     */
    public function destroy(Request $request, int $assembly): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'AssemblyController::destroy', ['assembly_id' => $assembly]);

        try {
            $record = Assembly::findOrFail($assembly);

            if ($record->status === 'completed') {
                return $this->errorResponse(
                    'Cannot delete a completed assembly. Cancel it first to reverse stock movements.',
                    422
                );
            }

            $record->delete();

            Log::info('[AssemblyController] Deleted', $ctx);
            return $this->successResponse(['message' => 'Assembly deleted successfully.']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Assembly not found.', 404);
        } catch (Throwable $e) {
            $this->logException('AssemblyController::destroy', $e, $ctx);
            return $this->errorResponse('Failed to delete assembly.', 500);
        }
    }

    // ────────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ────────────────────────────────────────────────────────────────────────────

    private function generateAssemblyNumber(): string
    {
        $max = Assembly::withTrashed()->count();
        return 'ASM-' . str_pad($max + 1, 6, '0', STR_PAD_LEFT);
    }
}
