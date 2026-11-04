<?php

namespace Database\Seeders;

use App\Models\MasterDataGroup;
use Illuminate\Database\Seeder;

class MasterDataSeeder extends Seeder
{
    /**
     * @var array<string, array{name: string, options: list<string>}>
     */
    private const GROUPS = [
        'vehicle_type' => [
            'name' => 'Jenis Kendaraan',
            'options' => ['Truck Box', 'Pickup', 'Motor Roda Tiga', 'Van'],
        ],
        'vehicle_status' => [
            'name' => 'Status Kendaraan',
            'options' => ['Aktif', 'Dalam Perbaikan', 'Nonaktif'],
        ],
        'kitchen_tool_category' => [
            'name' => 'Kategori Alat Dapur',
            'options' => ['Alat Masak', 'Alat Saji', 'Alat Penyimpanan', 'Alat Kebersihan'],
        ],
        'physical_condition' => [
            'name' => 'Kondisi Fisik',
            'options' => ['Baik', 'Perlu Perbaikan', 'Rusak Berat'],
        ],
        'maintenance_type' => [
            'name' => 'Jenis Perawatan',
            'options' => ['Servis Rutin', 'Ganti Oli', 'Ganti Ban', 'Perbaikan Insidental'],
        ],
        'maintenance_status' => [
            'name' => 'Status Perawatan',
            'options' => ['Terjadwal', 'Selesai', 'Terlambat'],
        ],
        'vehicle_component' => [
            'name' => 'Komponen Kendaraan',
            'options' => ['Oli Mesin', 'Air Radiator', 'Rem', 'Kopling', 'Aki', 'Ban', 'Lampu', 'Kebersihan'],
        ],
        'complaint_category' => [
            'name' => 'Kategori Pengaduan',
            'options' => ['Kerusakan Alat Dapur', 'Kendala Kendaraan', 'Lainnya'],
        ],
        'ticket_priority' => [
            'name' => 'Tingkat Prioritas',
            'options' => ['Rendah', 'Sedang', 'Kritis'],
        ],
    ];

    /**
     * Seed the reference groups and options the system depends on. Safe to run
     * on every deploy: missing rows are created, while options an admin has
     * already edited (label, order, active state) are left untouched.
     */
    public function run(): void
    {
        foreach (self::GROUPS as $code => $definition) {
            $group = MasterDataGroup::updateOrCreate(
                ['code' => $code],
                ['name' => $definition['name'], 'is_locked' => true],
            );

            foreach ($definition['options'] as $sortOrder => $label) {
                $group->options()->firstOrCreate(
                    ['code' => str($label)->slug()],
                    ['label' => $label, 'sort_order' => $sortOrder, 'is_active' => true],
                );
            }
        }
    }
}
