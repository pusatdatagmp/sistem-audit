<?php

namespace App\Http\Controllers\Role;

use App\Http\Controllers\Controller;
use App\Http\Requests\Role\StoreRoleRequest;
use App\Http\Requests\Role\UpdateRoleRequest;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('roles/index', [
            'roles' => Role::query()
                ->withCount(['users', 'permissions'])
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('roles/create', [
            'permissionGroups' => $this->groupedPermissions(),
        ]);
    }

    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $role = Role::create([
            ...$request->safe()->only(['code', 'name', 'description']),
            'is_locked' => false,
        ]);

        $role->permissions()->sync($request->validated('permissions', []));

        return to_route('roles.index')->with('success', 'Role berhasil ditambahkan.');
    }

    public function edit(Role $role): Response
    {
        return Inertia::render('roles/edit', [
            'role' => $role->load('permissions:id'),
            'permissionGroups' => $this->groupedPermissions(),
        ]);
    }

    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        $newPermissionIds = $request->validated('permissions', []);

        if ($this->wouldStrandRoleManagement($role, $newPermissionIds)) {
            return back()->withErrors([
                'permissions' => 'Tidak bisa menghapus izin "Kelola Role & Pengguna" dari role ini karena tidak akan ada lagi yang bisa mengelola role.',
            ]);
        }

        $role->update($request->safe()->only(['name', 'description']));
        $role->permissions()->sync($newPermissionIds);

        return to_route('roles.index')->with('success', 'Role berhasil diperbarui.');
    }

    public function destroy(Role $role): RedirectResponse
    {
        if ($role->is_locked) {
            return back()->withErrors(['role' => 'Role ini dikunci sistem dan tidak bisa dihapus.']);
        }

        try {
            $role->delete();
        } catch (QueryException) {
            return back()->withErrors([
                'role' => 'Role tidak bisa dihapus karena masih dipakai pengguna. Pindahkan pengguna itu ke role lain dahulu.',
            ]);
        }

        return to_route('roles.index')->with('success', 'Role berhasil dihapus.');
    }

    /**
     * @return Collection<string, Collection<int, Permission>>
     */
    private function groupedPermissions(): Collection
    {
        return Permission::query()->orderBy('group')->orderBy('name')->get()->groupBy('group');
    }

    /**
     * @param  list<int>  $newPermissionIds
     */
    private function wouldStrandRoleManagement(Role $role, array $newPermissionIds): bool
    {
        $rolesManageId = Permission::query()->where('code', Permission::ROLES_MANAGE)->value('id');

        if (! $rolesManageId || ! $role->users()->exists()) {
            return false;
        }

        $currentlyGrants = $role->permissions()->where('permissions.id', $rolesManageId)->exists();
        $willGrant = in_array($rolesManageId, $newPermissionIds, true);

        if (! $currentlyGrants || $willGrant) {
            return false;
        }

        return ! Role::query()
            ->whereKeyNot($role->id)
            ->whereHas('permissions', fn ($query) => $query->where('permissions.id', $rolesManageId))
            ->whereHas('users')
            ->exists();
    }
}
