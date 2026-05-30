<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCountryRequest;
use App\Http\Requests\UpdateCountryRequest;
use App\Models\Country;
use App\Models\DistributionLocationNode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class CountryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'CountryController::index');

        try {
            $countries = Country::query()
                ->when($request->boolean('trashed'), fn ($q) => $q->onlyTrashed())
                ->when($request->input('search'), fn ($q, $s) => $q->search($s))
                ->withCount(['nodes as children_count'])
                ->orderBy('name')
                ->get(['id', 'name', 'code', 'phone_code', 'currency_code', 'currency_symbol', 'phone_digits', 'is_active', 'created_at', 'deleted_at']);

            return $this->successResponse(['data' => $countries]);

        } catch (Throwable $e) {
            $this->logException('CountryController::index', $e, $ctx);
            return $this->errorResponse('Failed to fetch countries.', 500);
        }
    }

    public function show(Request $request, Country $country): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'CountryController::show');

        try {
            return $this->successResponse(['data' => $country]);
        } catch (Throwable $e) {
            $this->logException('CountryController::show', $e, $ctx);
            return $this->errorResponse('Failed to fetch country.', 500);
        }
    }

    public function store(StoreCountryRequest $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'CountryController::store');

        try {
            $country = Country::create([
                'name'            => trim($request->validated('name')),
                'code'            => $request->validated('code') ? strtoupper(trim($request->validated('code'))) : null,
                'is_active'       => $request->validated('is_active', true),
                'created_by'      => $request->user()?->id,
                'phone_code'      => $request->validated('phone_code') ? trim($request->validated('phone_code')) : null,
                'currency_code'   => $request->validated('currency_code') ? strtoupper(trim($request->validated('currency_code'))) : null,
                'currency_symbol' => $request->validated('currency_symbol') ? trim($request->validated('currency_symbol')) : null,
                'phone_digits'    => $request->validated('phone_digits'),
            ]);

            Log::info('[CountryController] Created', array_merge($ctx, ['country_id' => $country->id]));
            return $this->successResponse(['message' => 'Country created.', 'data' => $country->loadCount('nodes as children_count')], 201);

        } catch (Throwable $e) {
            $this->logException('CountryController::store', $e, $ctx);
            return $this->errorResponse('Failed to create country.', 500);
        }
    }

    public function update(UpdateCountryRequest $request, Country $country): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'CountryController::update');

        try {
            $country->update([
                'name'            => trim($request->validated('name')),
                'code'            => $request->validated('code') ? strtoupper(trim($request->validated('code'))) : null,
                'is_active'       => $request->validated('is_active', $country->is_active),
                'phone_code'      => $request->validated('phone_code') ? trim($request->validated('phone_code')) : null,
                'currency_code'   => $request->validated('currency_code') ? strtoupper(trim($request->validated('currency_code'))) : null,
                'currency_symbol' => $request->validated('currency_symbol') ? trim($request->validated('currency_symbol')) : null,
                'phone_digits'    => $request->validated('phone_digits'),
            ]);

            Log::info('[CountryController] Updated', array_merge($ctx, ['country_id' => $country->id]));
            return $this->successResponse(['message' => 'Country updated.', 'data' => $country->fresh()->loadCount('nodes as children_count')]);

        } catch (Throwable $e) {
            $this->logException('CountryController::update', $e, $ctx);
            return $this->errorResponse('Failed to update country.', 500);
        }
    }

    public function destroy(Request $request, Country $country): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'CountryController::destroy');

        try {
            if ($country->nodes()->count() > 0) {
                return $this->errorResponse(
                    'Cannot delete: this country has locations. Delete them first.',
                    422
                );
            }

            $country->delete();
            Log::info('[CountryController] Deleted', array_merge($ctx, ['country_id' => $country->id]));
            return $this->successResponse(['message' => 'Country deleted.']);

        } catch (Throwable $e) {
            $this->logException('CountryController::destroy', $e, $ctx);
            return $this->errorResponse('Failed to delete country.', 500);
        }
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'CountryController::bulkDestroy');

        try {
            $request->validate([
                'ids'   => ['required', 'array', 'min:1', 'max:500'],
                'ids.*' => ['integer'],
            ]);

            $ids = array_map('intval', $request->input('ids'));

            // Guard: block if any country still has active nodes
            $blockedIds = DistributionLocationNode::whereIn('country_id', $ids)
                ->whereNull('deleted_at')
                ->distinct()
                ->pluck('country_id')
                ->values();

            if ($blockedIds->isNotEmpty()) {
                $names = Country::whereIn('id', $blockedIds)->orderBy('name')->pluck('name')->implode(', ');
                return $this->errorResponse(
                    "Cannot delete: the following countries still have locations — {$names}. Delete their locations first.",
                    422
                );
            }

            $count = 0;
            DB::transaction(function () use ($ids, &$count) {
                $count = Country::whereIn('id', $ids)->delete();
            });

            Log::info('[CountryController] Bulk deleted', array_merge($ctx, ['ids' => $ids, 'count' => $count]));
            return $this->successResponse(['message' => "{$count} " . ($count === 1 ? 'country' : 'countries') . " deleted."]);

        } catch (Throwable $e) {
            $this->logException('CountryController::bulkDestroy', $e, $ctx);
            return $this->errorResponse('Failed to bulk delete countries.', 500);
        }
    }

    public function bulkRestore(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'CountryController::bulkRestore');

        try {
            $request->validate([
                'ids'   => ['required', 'array', 'min:1', 'max:500'],
                'ids.*' => ['integer'],
            ]);

            $ids = array_map('intval', $request->input('ids'));

            $count = 0;
            DB::transaction(function () use ($ids, &$count) {
                $count = Country::withTrashed()->whereIn('id', $ids)->restore();
                // Cascade: restore all trashed nodes belonging to these countries
                DistributionLocationNode::withTrashed()
                    ->whereIn('country_id', $ids)
                    ->whereNotNull('deleted_at')
                    ->restore();
            });

            Log::info('[CountryController] Bulk restored', array_merge($ctx, ['ids' => $ids, 'count' => $count]));
            return $this->successResponse(['message' => "{$count} " . ($count === 1 ? 'country' : 'countries') . " restored."]);

        } catch (Throwable $e) {
            $this->logException('CountryController::bulkRestore', $e, $ctx);
            return $this->errorResponse('Failed to bulk restore countries.', 500);
        }
    }

    public function restore(Request $request, int $id): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'CountryController::restore');

        try {
            $country = Country::withTrashed()->findOrFail($id);

            if (!$country->trashed()) {
                return $this->errorResponse('Country is not deleted.', 422);
            }

            $country->restore();

            Log::info('[CountryController] Restored', array_merge($ctx, ['country_id' => $country->id]));
            return $this->successResponse(['message' => 'Country restored.', 'data' => $country->fresh()->loadCount('nodes as children_count')]);

        } catch (Throwable $e) {
            $this->logException('CountryController::restore', $e, $ctx);
            return $this->errorResponse('Failed to restore country.', 500);
        }
    }

    public function suggest(Request $request): JsonResponse
    {
        $q = trim($request->input('q', ''));

        if (strlen($q) < 2) {
            return $this->successResponse(['data' => []]);
        }

        $cacheKey = 'country_suggest_' . strtolower($q);

        $results = Cache::remember($cacheKey, 3600, function () use ($q) {
            try {
                $response = Http::timeout(5)->get("https://restcountries.com/v3.1/name/{$q}", [
                    'fields' => 'name,cca2,idd,currencies',
                ]);

                if (!$response->successful()) {
                    return [];
                }

                return collect($response->json())->take(10)->map(function ($c) {
                    $root   = $c['idd']['root'] ?? '';
                    $suffix = $c['idd']['suffixes'][0] ?? '';
                    $currKey = array_key_first($c['currencies'] ?? []);
                    return [
                        'name'            => $c['name']['common'] ?? '',
                        'code'            => $c['cca2'] ?? null,
                        'phone_code'      => ($root && $suffix) ? $root . $suffix : null,
                        'currency_code'   => $currKey ?? null,
                        'currency_symbol' => $currKey ? ($c['currencies'][$currKey]['symbol'] ?? null) : null,
                    ];
                })->values()->all();

            } catch (Throwable $e) {
                Log::warning('[CountryController] Suggest fetch failed', ['error' => $e->getMessage()]);
                return [];
            }
        });

        return $this->successResponse(['data' => $results]);
    }
}
