<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'kitchen_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function kitchen(): BelongsTo
    {
        return $this->belongsTo(Kitchen::class);
    }

    public function performedInventoryLogs(): HasMany
    {
        return $this->hasMany(InventoryLog::class, 'performed_by');
    }

    public function reportedTickets(): HasMany
    {
        return $this->hasMany(ComplaintTicket::class, 'reporter_id');
    }

    public function assignedTickets(): HasMany
    {
        return $this->hasMany(ComplaintTicket::class, 'assigned_to');
    }

    public function vehicleUsageLogs(): HasMany
    {
        return $this->hasMany(VehicleUsageLog::class, 'driver_id');
    }

    public function performedVehicleInspections(): HasMany
    {
        return $this->hasMany(VehicleInspection::class, 'inspected_by');
    }

    public function isAdmin(): bool
    {
        return $this->role?->code === Role::CODE_ADMIN;
    }

    public function isDriver(): bool
    {
        return $this->role?->code === Role::CODE_DRIVER;
    }

    public function hasPermission(string $code): bool
    {
        return $this->role?->hasPermission($code) ?? false;
    }

    /**
     * @param  list<string>  $codes
     */
    public function hasAnyPermission(array $codes): bool
    {
        if ($codes === []) {
            return false;
        }

        foreach ($codes as $code) {
            if ($this->hasPermission($code)) {
                return true;
            }
        }

        return false;
    }

    /**
     * The route this user should land on right after logging in, based on
     * what their role actually grants access to.
     */
    public function homeRouteName(): string
    {
        return match (true) {
            $this->hasPermission(Permission::DASHBOARD_VIEW) => 'dashboard',
            $this->hasPermission(Permission::DRIVER_PORTAL_ACCESS) => 'driver.index',
            default => 'portal.index',
        };
    }
}
