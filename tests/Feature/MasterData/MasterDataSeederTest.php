<?php

use App\Models\MasterDataGroup;
use App\Models\MasterDataOption;
use Database\Seeders\MasterDataSeeder;

test('the master data seeder creates the locked reference groups the system depends on', function () {
    $this->seed(MasterDataSeeder::class);

    expect(MasterDataGroup::query()->where('is_locked', true)->pluck('code')->all())
        ->toContain('kitchen_tool_category', 'complaint_category', 'ticket_priority', 'vehicle_type', 'vehicle_status', 'physical_condition');

    expect(MasterDataOption::ofGroup('physical_condition')->pluck('code')->all())
        ->toEqualCanonicalizing(['baik', 'perlu-perbaikan', 'rusak-berat']);
});

test('re-running the master data seeder keeps admin edits and restores missing options', function () {
    $this->seed(MasterDataSeeder::class);

    $edited = MasterDataOption::ofGroup('ticket_priority')->where('code', 'kritis')->firstOrFail();
    $edited->update(['label' => 'Sangat Kritis', 'sort_order' => 9, 'is_active' => false]);

    MasterDataOption::ofGroup('ticket_priority')->where('code', 'rendah')->delete();

    $this->seed(MasterDataSeeder::class);

    expect($edited->fresh())
        ->label->toBe('Sangat Kritis')
        ->sort_order->toBe(9)
        ->is_active->toBeFalse();

    expect(MasterDataOption::ofGroup('ticket_priority')->where('code', 'rendah')->exists())->toBeTrue()
        ->and(MasterDataOption::ofGroup('ticket_priority')->count())->toBe(3);
});
