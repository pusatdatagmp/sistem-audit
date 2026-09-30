<?php

namespace App\Http\Controllers\Ticket;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ticket\StoreTicketRequest;
use App\Http\Requests\Ticket\UpdateTicketRequest;
use App\Http\Requests\Ticket\UpdateTicketStatusRequest;
use App\Models\ComplaintTicket;
use App\Models\Kitchen;
use App\Models\KitchenTool;
use App\Models\MasterDataOption;
use App\Models\User;
use App\Models\Vehicle;
use App\Services\Ticketing\TicketService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    public function __construct(private readonly TicketService $ticketService) {}

    public function index(Request $request): Response
    {
        $tickets = ComplaintTicket::query()
            ->with(['reporter', 'kitchen', 'category', 'priority', 'assignedTo'])
            ->when($request->string('status')->toString(), fn ($query, $status) => $query->where('status', $status))
            ->when($request->integer('priority_option_id'), fn ($query, $id) => $query->where('priority_option_id', $id))
            ->when($request->integer('category_option_id'), fn ($query, $id) => $query->where('category_option_id', $id))
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('ticket_number', 'like', "%{$search}%")
                        ->orWhere('subject', 'like', "%{$search}%");
                });
            })
            ->orderByRaw("CASE WHEN status = 'open' THEN 0 WHEN status = 'in_progress' THEN 1 ELSE 2 END")
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('tickets/index', [
            'tickets' => $tickets,
            'categoryOptions' => MasterDataOption::ofGroup('complaint_category')->active()->orderBy('sort_order')->get(['id', 'code', 'label']),
            'priorityOptions' => MasterDataOption::ofGroup('ticket_priority')->active()->orderBy('sort_order')->get(['id', 'code', 'label']),
            'filters' => $request->only(['status', 'priority_option_id', 'category_option_id', 'search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('tickets/create', [
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

        return to_route('tickets.show', $ticket)->with('success', 'Tiket pengaduan berhasil dibuat.');
    }

    public function show(ComplaintTicket $ticket): Response
    {
        return Inertia::render('tickets/show', [
            'ticket' => $ticket->load([
                'reporter', 'kitchen', 'category', 'priority', 'relatedKitchenTool', 'relatedVehicle', 'assignedTo',
                'updates' => fn ($query) => $query->with('user')->latest(),
            ]),
            'users' => User::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function edit(ComplaintTicket $ticket): Response
    {
        return Inertia::render('tickets/edit', [
            'ticket' => $ticket,
            'kitchens' => Kitchen::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'categoryOptions' => MasterDataOption::ofGroup('complaint_category')->active()->orderBy('sort_order')->get(['id', 'code', 'label']),
            'priorityOptions' => MasterDataOption::ofGroup('ticket_priority')->active()->orderBy('sort_order')->get(['id', 'code', 'label']),
            'kitchenTools' => KitchenTool::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'vehicles' => Vehicle::query()->where('is_active', true)->orderBy('plate_number')->get(['id', 'plate_number']),
        ]);
    }

    public function update(UpdateTicketRequest $request, ComplaintTicket $ticket): RedirectResponse
    {
        $ticket->update($request->validated());

        return to_route('tickets.show', $ticket)->with('success', 'Tiket pengaduan berhasil diperbarui.');
    }

    public function updateStatus(UpdateTicketStatusRequest $request, ComplaintTicket $ticket): RedirectResponse
    {
        $this->ticketService->changeStatus(
            $ticket,
            $request->string('status')->toString(),
            $request->user(),
            $request->integer('assigned_to') ?: null,
            $request->input('note'),
        );

        return back()->with('success', 'Status tiket berhasil diperbarui.');
    }
}
