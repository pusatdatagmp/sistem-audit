<?php

namespace Database\Seeders;

use App\Models\ComplaintTicket;
use App\Models\Kitchen;
use App\Models\KitchenInventory;
use App\Models\MasterDataOption;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleMaintenanceSchedule;
use App\Services\Inventory\StockMutationService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class DashboardSeeder extends Seeder
{
    /**
     * @var list<string>
     */
    private const KITCHEN_TOOL_SUBJECTS = [
        'Panci besar penyok dan sulit ditutup rapat',
        'Wajan sudah tidak rata, makanan gosong sebelah',
        'Termos nasi rusak, nasi cepat dingin',
        'Nampan saji penyok dan mulai berkarat',
        'Sikat cuci piring sudah gundul, perlu diganti',
    ];

    /**
     * @var list<string>
     */
    private const VEHICLE_SUBJECTS = [
        'Kendaraan mengalami kebocoran oli mesin',
        'Rem kendaraan kurang pakem saat digunakan',
        'AC kendaraan tidak dingin selama perjalanan',
        'Ban kendaraan aus dan perlu diganti',
        'Suara mesin kasar saat kendaraan dinyalakan',
    ];

    /**
     * @var list<string>
     */
    private const OTHER_SUBJECTS = [
        'Permintaan penambahan stok alat masak',
        'Keluhan kebersihan area dapur',
        'Usulan jadwal ulang pengiriman logistik',
        'Permintaan pelatihan penggunaan alat baru',
    ];

    public function run(StockMutationService $stockMutationService): void
    {
        $reporter = User::query()->where('email', 'staff@example.com')->first() ?? User::query()->first();
        $assignee = User::query()->where('email', 'test@example.com')->first() ?? $reporter;
        $kitchens = Kitchen::all();
        $vehicles = Vehicle::all();

        if (! $reporter || $kitchens->isEmpty()) {
            $this->command?->warn('DashboardSeeder dilewati: jalankan RoleSeeder & KitchenSeeder terlebih dahulu.');

            return;
        }

        if (ComplaintTicket::query()->exists()) {
            $this->command?->info('DashboardSeeder dilewati: data tiket sudah ada.');
        } else {
            $this->seedTickets($reporter, $assignee, $kitchens, $vehicles);
        }

        if ($vehicles->isNotEmpty()) {
            if (VehicleMaintenanceSchedule::query()->exists()) {
                $this->command?->info('DashboardSeeder dilewati: data jadwal perawatan sudah ada.');
            } else {
                $this->seedMaintenanceSchedules($vehicles, $assignee);
            }
        }

        $this->seedInventoryConditions($stockMutationService, $assignee);
    }

    /**
     * @param  Collection<int, Kitchen>  $kitchens
     * @param  Collection<int, Vehicle>  $vehicles
     */
    private function seedTickets(User $reporter, ?User $assignee, $kitchens, $vehicles): void
    {
        $categories = MasterDataOption::ofGroup('complaint_category')->get()->keyBy('code');
        $priorities = MasterDataOption::ofGroup('ticket_priority')->get()->keyBy('code');

        if ($categories->isEmpty() || $priorities->isEmpty()) {
            $this->command?->warn('DashboardSeeder dilewati: jalankan MasterDataSeeder terlebih dahulu.');

            return;
        }

        $troubledVehicle = $vehicles->first();

        // Backlog lama, sebagian besar sudah selesai, untuk mengisi total tiket historis.
        foreach (range(20, 15) as $daysAgo) {
            $this->createTicket(
                reporter: $reporter,
                assignee: $assignee,
                kitchen: $kitchens->random(),
                category: $categories->get('kerusakan-alat-dapur') ?? $categories->random(),
                priority: $priorities->random(),
                subject: fake()->randomElement(self::KITCHEN_TOOL_SUBJECTS),
                status: 'resolved',
                daysAgo: $daysAgo,
            );
        }

        // 14 hari terakhir, campuran status agar grafik tren dan status terlihat wajar.
        foreach (range(13, 0) as $daysAgo) {
            $ticketsToday = fake()->numberBetween(0, 2);

            for ($i = 0; $i < $ticketsToday; $i++) {
                $categoryCode = fake()->randomElement(['kerusakan-alat-dapur', 'kerusakan-alat-dapur', 'kendala-kendaraan', 'lainnya']);
                $category = $categories->get($categoryCode) ?? $categories->random();

                $isVehicleIssue = $categoryCode === 'kendala-kendaraan' && $troubledVehicle;

                $this->createTicket(
                    reporter: $reporter,
                    assignee: $assignee,
                    kitchen: $kitchens->random(),
                    category: $category,
                    priority: $priorities->random(),
                    subject: match ($categoryCode) {
                        'kendala-kendaraan' => fake()->randomElement(self::VEHICLE_SUBJECTS),
                        'lainnya' => fake()->randomElement(self::OTHER_SUBJECTS),
                        default => fake()->randomElement(self::KITCHEN_TOOL_SUBJECTS),
                    },
                    status: $this->randomStatusForAge($daysAgo),
                    daysAgo: $daysAgo,
                    relatedVehicle: $isVehicleIssue ? $troubledVehicle : null,
                );
            }
        }

        // Pastikan ada minimal satu tiket kendaraan yang masih terbuka, agar status
        // armada di dashboard menunjukkan kendaraan "Dalam Perbaikan".
        if ($troubledVehicle) {
            $this->createTicket(
                reporter: $reporter,
                assignee: $assignee,
                kitchen: $kitchens->random(),
                category: $categories->get('kendala-kendaraan') ?? $categories->random(),
                priority: $priorities->get('kritis') ?? $priorities->random(),
                subject: 'Kendaraan mogok, perlu perbaikan bengkel segera',
                status: 'in_progress',
                daysAgo: 1,
                relatedVehicle: $troubledVehicle,
            );

            $inRepair = MasterDataOption::ofGroup('vehicle_status')->where('code', 'dalam-perbaikan')->first();

            if ($inRepair) {
                $troubledVehicle->update(['status_option_id' => $inRepair->id]);
            }
        }
    }

    private function createTicket(
        User $reporter,
        ?User $assignee,
        Kitchen $kitchen,
        MasterDataOption $category,
        MasterDataOption $priority,
        string $subject,
        string $status,
        int $daysAgo,
        ?Vehicle $relatedVehicle = null,
    ): ComplaintTicket {
        $createdAt = Carbon::now()->subDays($daysAgo)->setTime(fake()->numberBetween(7, 17), fake()->numberBetween(0, 59));
        $resolvedAt = null;

        if ($status === 'resolved') {
            $resolvedAt = $createdAt->copy()->addHours(fake()->numberBetween(4, 48));

            if ($resolvedAt->isFuture()) {
                $resolvedAt = Carbon::now();
            }
        }

        return ComplaintTicket::create([
            'reporter_id' => $reporter->id,
            'kitchen_id' => $kitchen->id,
            'category_option_id' => $category->id,
            'priority_option_id' => $priority->id,
            'status' => $status,
            'related_vehicle_id' => $relatedVehicle?->id,
            'subject' => $subject,
            'description' => $subject.'. Mohon segera ditindaklanjuti.',
            'assigned_to' => $status === 'open' ? null : $assignee?->id,
            'resolved_at' => $resolvedAt,
            'created_at' => $createdAt,
        ]);
    }

    /**
     * Tiket yang lebih baru cenderung masih open/in progress, tiket yang lebih
     * lama cenderung sudah resolved — meniru pola backlog yang wajar.
     */
    private function randomStatusForAge(int $daysAgo): string
    {
        $weights = match (true) {
            $daysAgo <= 1 => ['open' => 65, 'in_progress' => 25, 'resolved' => 10],
            $daysAgo <= 5 => ['open' => 30, 'in_progress' => 40, 'resolved' => 30],
            default => ['open' => 10, 'in_progress' => 25, 'resolved' => 65],
        };

        $roll = fake()->numberBetween(1, 100);
        $cumulative = 0;

        foreach ($weights as $status => $weight) {
            $cumulative += $weight;

            if ($roll <= $cumulative) {
                return $status;
            }
        }

        return 'open';
    }

    /**
     * @param  Collection<int, Vehicle>  $vehicles
     */
    private function seedMaintenanceSchedules($vehicles, ?User $completedBy): void
    {
        $types = MasterDataOption::ofGroup('maintenance_type')->get();
        $scheduledStatus = MasterDataOption::ofGroup('maintenance_status')->where('code', 'terjadwal')->first();
        $completedStatus = MasterDataOption::ofGroup('maintenance_status')->where('code', 'selesai')->first();

        if ($types->isEmpty() || ! $scheduledStatus || ! $completedStatus) {
            $this->command?->warn('DashboardSeeder dilewati: jalankan MasterDataSeeder terlebih dahulu.');

            return;
        }

        // Terlambat: sudah lewat tanggal jadwal tapi belum ditandai selesai.
        foreach ([6, 2] as $index => $daysAgo) {
            VehicleMaintenanceSchedule::create([
                'vehicle_id' => $vehicles->get($index % $vehicles->count())->id,
                'maintenance_type_option_id' => $types->random()->id,
                'status_option_id' => $scheduledStatus->id,
                'scheduled_date' => Carbon::today()->subDays($daysAgo),
                'odometer_at_schedule' => fake()->numberBetween(10000, 90000),
            ]);
        }

        // Akan datang: jadwal masih di depan.
        foreach ([3, 9] as $index => $daysAhead) {
            VehicleMaintenanceSchedule::create([
                'vehicle_id' => $vehicles->get($index % $vehicles->count())->id,
                'maintenance_type_option_id' => $types->random()->id,
                'status_option_id' => $scheduledStatus->id,
                'scheduled_date' => Carbon::today()->addDays($daysAhead),
                'odometer_at_schedule' => fake()->numberBetween(10000, 90000),
            ]);
        }

        // Riwayat perawatan yang sudah selesai bulan lalu.
        VehicleMaintenanceSchedule::create([
            'vehicle_id' => $vehicles->first()->id,
            'maintenance_type_option_id' => $types->random()->id,
            'status_option_id' => $completedStatus->id,
            'scheduled_date' => Carbon::today()->subDays(20),
            'odometer_at_schedule' => fake()->numberBetween(10000, 90000),
            'completed_at' => Carbon::now()->subDays(19),
            'completed_by' => $completedBy?->id,
        ]);
    }

    private function seedInventoryConditions(StockMutationService $stockMutationService, ?User $actor): void
    {
        if (! $actor) {
            return;
        }

        $alreadySeeded = KitchenInventory::query()
            ->where('quantity_needs_repair', '>', 0)
            ->orWhere('quantity_damaged', '>', 0)
            ->exists();

        if ($alreadySeeded) {
            $this->command?->info('DashboardSeeder dilewati: kondisi inventaris sudah bervariasi.');

            return;
        }

        $candidates = KitchenInventory::query()
            ->where('quantity_good', '>=', 8)
            ->where('quantity_needs_repair', 0)
            ->where('quantity_damaged', 0)
            ->inRandomOrder()
            ->limit(3)
            ->get();

        $adjustments = [
            ['baik' => 7, 'perlu-perbaikan' => 2, 'rusak-berat' => 1],
            ['baik' => 8, 'perlu-perbaikan' => 1, 'rusak-berat' => 1],
            ['baik' => 9, 'perlu-perbaikan' => 1],
        ];

        foreach ($candidates as $index => $inventory) {
            $stockMutationService->opname(
                $inventory,
                $adjustments[$index] ?? ['perlu-perbaikan' => 1],
                $actor,
                'Hasil opname berkala (seeder demo dashboard).',
            );
        }
    }
}
