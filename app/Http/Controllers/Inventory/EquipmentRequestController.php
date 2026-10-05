<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Concerns\SortsQuery;
use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\StoreEquipmentRequestRequest;
use App\Http\Requests\Inventory\UpdateEquipmentRequestStatusRequest;
use App\Models\EquipmentRequest;
use App\Models\Kitchen;
use App\Models\KitchenTool;
use App\Models\MasterDataOption;
use App\Models\User;
use App\Services\Inventory\EquipmentRequestService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class EquipmentRequestController extends Controller
{
    use SortsQuery;

    public function __construct(private readonly EquipmentRequestService $equipmentRequestService) {}

    public function index(Request $request): Response
    {
        $query = EquipmentRequest::query()
            ->with(['kitchen', 'kitchenTool', 'newToolCategory', 'requestedBy', 'reviewedBy'])
            ->when($request->string('status')->toString(), fn ($query, $status) => $query->where('status', $status))
            ->when($request->integer('kitchen_id'), fn ($query, $kitchenId) => $query->where('kitchen_id', $kitchenId))
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('new_tool_name', 'like', "%{$search}%")
                        ->orWhere('reason', 'like', "%{$search}%")
                        ->orWhereHas('kitchenTool', fn ($q) => $q->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('requestedBy', fn ($q) => $q->where('name', 'like', "%{$search}%"));
                });
            });

        $sortable = [
            'quantity' => 'equipment_requests.quantity',
            'status' => 'equipment_requests.status',
            'kitchen' => fn () => Kitchen::query()->select('name')->whereColumn('id', 'equipment_requests.kitchen_id'),
            'requested_by' => fn () => User::query()->select('name')->whereColumn('id', 'equipment_requests.requested_by'),
        ];

        $sortState = $this->applySort($query, $request, $sortable, fn ($q) => $q->orderByDesc('equipment_requests.created_at'));

        $equipmentRequests = $query->paginate(20)->withQueryString();

        return Inertia::render('equipment-requests/index', [
            'equipmentRequests' => $equipmentRequests,
            'kitchens' => Kitchen::query()->orderBy('name')->get(['id', 'name']),
            'filters' => [
                ...$request->only(['status', 'kitchen_id', 'search']),
                ...$sortState,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('equipment-requests/create', [
            'kitchens' => Kitchen::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'kitchenTools' => KitchenTool::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'unit']),
            'categoryOptions' => MasterDataOption::ofGroup('kitchen_tool_category')->active()->orderBy('sort_order')->get(['id', 'code', 'label']),
        ]);
    }

    public function store(StoreEquipmentRequestRequest $request): RedirectResponse
    {
        EquipmentRequest::create([
            ...$request->validated(),
            'requested_by' => $request->user()->id,
            'status' => EquipmentRequest::STATUS_PENDING,
        ]);

        return to_route('equipment-requests.index')->with('success', 'Pengajuan berhasil dikirim.');
    }

    public function updateStatus(UpdateEquipmentRequestStatusRequest $request, EquipmentRequest $equipmentRequest): RedirectResponse
    {
        try {
            if ($request->validated('status') === EquipmentRequest::STATUS_APPROVED) {
                $this->equipmentRequestService->approve($equipmentRequest, $request->user(), $request->validated('note'));
                $message = 'Pengajuan disetujui dan stok berhasil ditambahkan.';
            } else {
                $this->equipmentRequestService->reject($equipmentRequest, $request->user(), $request->validated('note'));
                $message = 'Pengajuan ditolak.';
            }
        } catch (ValidationException $exception) {
            return back()->withErrors($exception->errors());
        }

        return back()->with('success', $message);
    }
}
