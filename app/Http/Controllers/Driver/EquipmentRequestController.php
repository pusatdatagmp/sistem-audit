<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\StoreEquipmentRequestRequest;
use App\Models\EquipmentRequest;
use App\Models\KitchenTool;
use App\Models\MasterDataOption;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EquipmentRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $equipmentRequests = EquipmentRequest::query()
            ->where('requested_by', $request->user()->id)
            ->with(['kitchen', 'kitchenTool', 'newToolCategory', 'requestedBy', 'reviewedBy'])
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('driver/equipment-requests/index', [
            'equipmentRequests' => $equipmentRequests,
        ]);
    }

    public function create(Request $request): Response
    {
        abort_unless($request->user()->kitchen_id, 403, 'Akun Anda belum terhubung ke dapur manapun. Hubungi admin untuk mengatur dapur Anda.');

        return Inertia::render('driver/equipment-requests/create', [
            'kitchen' => $request->user()->kitchen,
            'kitchenTools' => KitchenTool::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'unit']),
            'categoryOptions' => MasterDataOption::ofGroup('kitchen_tool_category')->active()->orderBy('sort_order')->get(['id', 'code', 'label']),
        ]);
    }

    public function store(StoreEquipmentRequestRequest $request): RedirectResponse
    {
        abort_unless($request->user()->kitchen_id, 403, 'Akun Anda belum terhubung ke dapur manapun. Hubungi admin untuk mengatur dapur Anda.');

        EquipmentRequest::create([
            ...$request->validated(),
            'requested_by' => $request->user()->id,
            'kitchen_id' => $request->user()->kitchen_id,
            'status' => EquipmentRequest::STATUS_PENDING,
        ]);

        return to_route('driver.equipment-requests.index')->with('success', 'Pengajuan berhasil dikirim.');
    }
}
