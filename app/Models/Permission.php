<?php

namespace App\Models;

use Database\Factories\PermissionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Permission extends Model
{
    /** @use HasFactory<PermissionFactory> */
    use HasFactory;

    public const DASHBOARD_VIEW = 'dashboard.view';

    public const INVENTORY_MANAGE = 'inventory.manage';

    public const MASTER_DATA_MANAGE = 'master-data.manage';

    public const VEHICLES_MANAGE = 'vehicles.manage';

    public const TICKETS_MANAGE = 'tickets.manage';

    public const ROLES_MANAGE = 'roles.manage';

    public const DRIVER_PORTAL_ACCESS = 'driver-portal.access';

    public const SETTINGS_MANAGE = 'settings.manage';

    /**
     * The full catalog of permissions known to the system, keyed by code.
     *
     * @var array<string, array{name: string, group: string}>
     */
    public const CATALOG = [
        self::DASHBOARD_VIEW => ['name' => 'Lihat Dashboard', 'group' => 'Umum'],
        self::INVENTORY_MANAGE => ['name' => 'Kelola Inventaris Dapur', 'group' => 'Inventaris'],
        self::MASTER_DATA_MANAGE => ['name' => 'Kelola Master Data', 'group' => 'Master Data'],
        self::VEHICLES_MANAGE => ['name' => 'Kelola Kendaraan & Perawatan', 'group' => 'Kendaraan'],
        self::TICKETS_MANAGE => ['name' => 'Kelola Tiket Pengaduan', 'group' => 'Pengaduan'],
        self::ROLES_MANAGE => ['name' => 'Kelola Role & Pengguna', 'group' => 'Administrasi'],
        self::DRIVER_PORTAL_ACCESS => ['name' => 'Akses Portal Driver', 'group' => 'Kendaraan'],
        self::SETTINGS_MANAGE => ['name' => 'Kelola Pengaturan Sistem', 'group' => 'Administrasi'],
    ];

    /**
     * @var list<string>
     */
    protected $fillable = [
        'code',
        'name',
        'group',
        'description',
    ];

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }
}
