<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAccountRequest;
use App\Http\Requests\UpdateAccountRequest;
use App\Models\Account;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class AccountController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'AccountController::index');

        try {
            $accounts = Account::select('id', 'name', 'type')
                ->when($request->boolean('trashed'), fn ($q) => $q->onlyTrashed())
                ->when($request->query('type'),      fn ($q, $v) => $q->ofType($v))
                ->orderBy('type')->orderBy('name')
                ->get();

            return $this->successResponse(['data' => $accounts]);

        } catch (Throwable $e) {
            $this->logException('AccountController::index', $e, $ctx);
            return $this->errorResponse('Failed to fetch accounts.', 500);
        }
    }

    public function store(StoreAccountRequest $request): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'AccountController::store');

        try {
            $account = Account::create($request->validated());
            Log::info('[AccountController] Created', array_merge($ctx, ['account_id' => $account->id]));
            return $this->successResponse(['message' => 'Account created.', 'data' => $account], 201);

        } catch (Throwable $e) {
            $this->logException('AccountController::store', $e, $ctx);
            return $this->errorResponse('Failed to create account.', 500);
        }
    }

    public function update(UpdateAccountRequest $request, int $account): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'AccountController::update', ['account_id' => $account]);

        try {
            $record = Account::findOrFail($account);
            $record->update($request->validated());
            Log::info('[AccountController] Updated', $ctx);
            return $this->successResponse(['message' => 'Account updated.', 'data' => $record]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Account not found.', 404);
        } catch (Throwable $e) {
            $this->logException('AccountController::update', $e, $ctx);
            return $this->errorResponse('Failed to update account.', 500);
        }
    }

    public function destroy(Request $request, int $account): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'AccountController::destroy', ['account_id' => $account]);

        try {
            Account::findOrFail($account)->delete();
            Log::info('[AccountController] Deleted', $ctx);
            return $this->successResponse(['message' => 'Account deleted.']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Account not found.', 404);
        } catch (Throwable $e) {
            $this->logException('AccountController::destroy', $e, $ctx);
            return $this->errorResponse('Failed to delete account.', 500);
        }
    }

    public function restore(Request $request, int $account): JsonResponse
    {
        $ctx = $this->buildCtx($request, 'AccountController::restore', ['account_id' => $account]);

        try {
            Account::onlyTrashed()->findOrFail($account)->restore();
            Log::info('[AccountController] Restored', array_merge($ctx, ['account_id' => $account]));
            return $this->successResponse(['message' => 'Account restored.']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->errorResponse('Deleted account not found.', 404);
        } catch (Throwable $e) {
            $this->logException('AccountController::restore', $e, $ctx);
            return $this->errorResponse('Failed to restore account.', 500);
        }
    }
}
