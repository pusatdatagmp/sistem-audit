<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ticket\StoreTicketRequest;
use App\Models\ComplaintTicket;
use App\Models\Kitchen;
use App\Models\KitchenTool;
use App\Models\MasterDataOption;
use App\Models\Vehicle;
use App\Services\Ticketing\TicketService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PortalTicketController extends Controller
{
    public function __construct(private readonly TicketService $ticketService) {}

    public function index(Request $request): Response
    {
        $tickets = ComplaintTicket::query()
            ->where('reporter_id', $request->user()->id)
            ->with(['category', 'priority'])
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('portal/index', [
            'tickets' => $tickets,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('portal/create', [
            'kitchens' => Kitchen::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'categoryOptions' => MasterDataOption::ofGroup('complaint_category')->active()->orderBy('sort_order')->get(['id', 'code', 'label']),
            'priorityOptions' => MasterDataOption::ofGroup('ticket_priority')->active()->orderBy('sort_order')->get(['id', 'code', 'label']),
            'kitchenTools' => KitchenTool::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'vehicles' => Vehicle::query()->where('is_active', true)->orderBy('plate_number')->get(['id', 'plate_number']),
        ]);
    }

    public function store(StoreTicketRequest $request): RedirectResponse
    {
        $ticket = $this->ticketService->createTicket($request->validated(), $request->user());

        return to_route('portal.show', $ticket)->with('success', 'Laporan berhasil dikirim.');
    }

    public function show(Request $request, ComplaintTicket $ticket): Response
    {
        abort_unless($ticket->reporter_id === $request->user()->id, 403);

        return Inertia::render('portal/show', [
            'ticket' => $ticket->load([
                'category', 'priority', 'kitchen', 'relatedKitchenTool', 'relatedVehicle', 'assignedTo',
                'updates' => fn ($query) => $query->with('user')->latest(),
            ]),
        ]);
    }
}
